import { SimpleEventDispatcher } from 'ste-simple-events'
import { MetricsConnection } from './connection'
import { JWT_TTL_LIMIT } from './constants'
import { ClientSideActionPrevented, SessionError } from './error'
import { DecodeJWT } from './lib/jwt'
import { Cache } from './models/cache'
import { FacilityData, PrivilegedFacility } from './models/facility'
import { FacilityLicenses } from './models/facilityLicense'
import { Stats } from './models/stats'
import { Tasks } from './models/task'
import { OAuthProviders, User, UserResponse, Users } from './models/user'

export interface AuthenticatedResponse {
  accessToken: string
  refreshToken?: string
}

export interface OAuthLoginResponse {
  url: string
}

export interface RefreshTokenChangeEvent {
  refreshToken: string
}

export interface JWTToken {
  user: { id: number }
  facility: FacilityData | null
  facilityRole: string | null
  type: 'access' | 'refresh'
  iat: number
  exp: number
  iss: string
  jti: string
  superUser?: boolean
}

export interface AccessToken extends JWTToken {
  type: 'access'
}

export interface RefreshToken extends JWTToken {
  type: 'refresh'
}

export class Authentication {
  static async useCredentials (connection: MetricsConnection, params: {email: string, password: string, refreshable: boolean}) {
    const response = await connection.action('auth:login', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async useToken (connection: MetricsConnection, params: { token: string }) {
    const response = await connection.action('user:show', { authorization: params.token }) as UserResponse
    return new UserSession(response, connection)
  }

  static async useResetToken (connection: MetricsConnection, params: { resetToken: string, password: string, refreshable: boolean}) {
    const response = await connection.action('auth:resetFulfillment', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async useOAuth (connection: MetricsConnection, params: {service: OAuthProviders, redirect: string}) {
    const response = await connection.action('oauth:initiate', { ...params, type: 'login' }) as OAuthLoginResponse
    return response.url
  }

  static async createUser (connection: MetricsConnection, params: {email: string, password: string, refreshable: boolean}) {
    const response = await connection.action('user:create', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async passwordReset (connection: MetricsConnection, params: {email: string}) {
    await connection.action('auth:resetRequest', params)
  }

  /** @hidden */
  static async useAdminCredentials (connection: MetricsConnection, params: {email: string, password: string, token: string, refreshable: boolean}) {
    const response = await connection.action('admin:login', params) as UserResponse
    return new AdminSession(response, connection)
  }

  /** @hidden */
  static async useAdminToken (connection: MetricsConnection, params: { token: string}) {
    const response = await connection.action('user:show', { authorization: params.token }) as UserResponse
    const accessToken = DecodeJWT(response.accessToken) as AccessToken
    if (accessToken?.superUser !== true) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for super-user actions.' })
    }
    return new AdminSession(response, connection)
  }
}

export class SessionHandler {
  private _connection: MetricsConnection
  private _keepAlive: boolean = true
  private _accessToken: string = ''
  private _refreshToken: string | null = null
  private _accessTokenTimeout: ReturnType<typeof setTimeout> | null = null
  private _onRefreshTokenChangeEvent = new SimpleEventDispatcher<RefreshTokenChangeEvent>()

  constructor (connection: MetricsConnection, loginResponse: UserResponse) {
    this._connection = connection
    this._connection.onDisposeEvent.one(() => this.close())
    this.updateTokens(loginResponse)
  }

  private updateTokens (response: AuthenticatedResponse) {
    if (response.accessToken) {
      this._accessToken = response.accessToken

      if (this._accessTokenTimeout) {
        clearTimeout(this._accessTokenTimeout)
      }

      if (this._keepAlive) {
        const tokenTTL = this.decodedAccessToken.exp * 1000 - Date.now() - JWT_TTL_LIMIT
        this._accessTokenTimeout = setTimeout(() => this.keepAccessTokenAlive(), tokenTTL)
      }

      if (response.refreshToken) {
        this._refreshToken = response.refreshToken
        this._onRefreshTokenChangeEvent.dispatchAsync({ refreshToken: this._refreshToken })
      }
    }
  }

  private async keepAccessTokenAlive () {
    if (this._keepAlive) {
      try {
        await this.action('auth:keepAlive')
      } catch (error) {
        return
      }
    }
  }

  get keepAlive () {
    return this._keepAlive
  }

  set keepAlive (value: boolean) {
    this._keepAlive = value
    if (!this._keepAlive && this._accessTokenTimeout) {
      clearTimeout(this._accessTokenTimeout)
    }
  }

  get decodedAccessToken () {
    return DecodeJWT(this._accessToken) as AccessToken
  }

  get refreshToken () {
    return this._refreshToken
  }

  get decodedRefreshToken () {
    return this._refreshToken ? DecodeJWT(this._refreshToken) as RefreshToken : undefined
  }

  get onRefreshTokenChangeEvent () {
    return this._onRefreshTokenChangeEvent.asEvent()
  }

  close () {
    this.keepAlive = false
    this._accessToken = ''
    this._refreshToken = null
  }

  async logout () {
    const authParams = { authorization: this._refreshToken ?? this._accessToken }
    await this._connection.action('auth:logout', authParams)
    this.close()
  }

  async action (action: string, params: Object = {}) {
    let response
    try {
      const authParams = { authorization: this._accessToken, ...params }
      response = await this._connection.action(action, authParams) as AuthenticatedResponse
    } catch (error) {
      if (error instanceof SessionError && this._refreshToken && (DecodeJWT(this._refreshToken) as RefreshToken).exp * 1000 - Date.now() > 0) {
        const authParams = { authorization: this._refreshToken, ...params }
        response = await this._connection.action(action, authParams) as AuthenticatedResponse
      } else {
        throw error
      }
    }
    this.updateTokens(response)
    return response
  }
}

export class UserSession {
  protected _sessionHandler: SessionHandler
  protected _user: User

  constructor (loginResponse: UserResponse, connection: MetricsConnection) {
    this._sessionHandler = new SessionHandler(connection, loginResponse)
    this._user = new User(loginResponse.user, this._sessionHandler)
  }

  get keepAlive () {
    return this._sessionHandler.keepAlive
  }

  set keepAlive (value: boolean) {
    this._sessionHandler.keepAlive = value
  }

  get refreshToken () {
    return this._sessionHandler.refreshToken
  }

  get onRefreshTokenChangeEvent () {
    return this._sessionHandler.onRefreshTokenChangeEvent
  }

  close () {
    this._sessionHandler.close()
  }

  async logout () {
    await this._sessionHandler.logout()
  }

  get user () {
    return this._user
  }

  get activeFacility () {
    return this._sessionHandler.decodedAccessToken.facility ? new PrivilegedFacility(this._sessionHandler.decodedAccessToken.facility, this._sessionHandler) : undefined
  }
}

/** @hidden */
export class AdminSession extends UserSession {

  get stats () {
    return new Stats(this._sessionHandler)
  }

  get users () {
    return new Users(this._sessionHandler)
  }

  get cache () {
    return new Cache(this._sessionHandler)
  }

  get tasks () {
    return new Tasks(this._sessionHandler)
  }

  get facilityLicenses () {
    return new FacilityLicenses(this._sessionHandler)
  }
}
