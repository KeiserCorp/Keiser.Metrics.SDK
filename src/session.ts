import { SimpleEventDispatcher } from 'ste-simple-events'
import { DecodeJWT } from './lib/jwt'
import { MetricsConnection } from './connection'
import { User, UserData, UserResponse } from './models/user'
import { JWT_TTL_LIMIT } from './constants'

export interface AuthenticatedResponse {
  accessToken: string
  refreshToken?: string
}

export interface LoginResponse extends AuthenticatedResponse {
  user: UserData
}

export interface RefreshTokenChangeEvent {
  refreshToken: string
}

export interface JWTToken {
  user: { id: number }
  facility: object | null
  facilityRole: string | null
  type: 'access' | 'refresh'
  iat: number
  exp: number
  iss: string
  jti: string
}

export interface AccessToken extends JWTToken {
  type: 'access'
}

export interface RefreshToken extends JWTToken {
  type: 'refresh'
}

export class Authentication {
  static async useCredentials (connection: MetricsConnection, email: string, password: string, refreshable: boolean = true) {
    const response = await connection.action('auth:login', { email, password, refreshable }) as LoginResponse
    return new Session(response, connection)
  }

  static async useToken (connection: MetricsConnection, token: string) {
    const response = await connection.action('user:show', { authorization: token }) as UserResponse
    return new Session(response, connection)
  }
}

export class SessionHandler {
  private _connection: MetricsConnection
  private _keepAlive: boolean = true
  private _accessToken: string = ''
  private _refreshToken: string | null = null
  private _accessTokenTimeout: ReturnType<typeof setTimeout> | null = null
  private _onRefreshTokenChangeEvent = new SimpleEventDispatcher<RefreshTokenChangeEvent>()

  constructor (connection: MetricsConnection, loginResponse: LoginResponse) {
    this._connection = connection
    this.updateTokens(loginResponse)
  }

  private updateTokens (response: AuthenticatedResponse) {
    if (response.accessToken) {
      this._accessToken = response.accessToken

      if (this._accessTokenTimeout) {
        clearTimeout(this._accessTokenTimeout)
      }

      if (this._keepAlive) {
        const tokenTTL = (DecodeJWT(this._accessToken) as AccessToken).exp * 1000 - Date.now() - JWT_TTL_LIMIT
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
      await this.action('auth:keepAlive')
    }
  }

  public get keepAlive () {
    return this._keepAlive
  }

  public set keepAlive (value: boolean) {
    this._keepAlive = value
    if (!this._keepAlive && this._accessTokenTimeout) {
      clearTimeout(this._accessTokenTimeout)
    }
  }

  public get refreshToken () {
    return this._refreshToken
  }

  public get onRefreshTokenChangeEvent () {
    return this._onRefreshTokenChangeEvent.asEvent()
  }

  public close () {
    this.keepAlive = false
    this._accessToken = ''
    this._refreshToken = null
  }

  public async logout () {
    const authParams = { authorization: this._refreshToken ?? this._accessToken }
    await this._connection.action('auth:logout', authParams)
    this.close()
  }

  public async action (action: string, params: Object = {}) {
    let response
    try {
      const authParams = { authorization: this._accessToken, ...params }
      response = await this._connection.action(action, authParams) as AuthenticatedResponse
    } catch (error) {
      if (error?.error.code === 616 && this._refreshToken && (DecodeJWT(this._refreshToken) as RefreshToken).exp * 1000 - Date.now() > 0) {
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

export class Session {
  private _sessionHandler: SessionHandler
  private _user: User

  constructor (loginResponse: LoginResponse, connection: MetricsConnection) {
    this._sessionHandler = new SessionHandler(connection, loginResponse)
    this._user = new User(loginResponse.user, this._sessionHandler)
  }

  public get keepAlive () {
    return this._sessionHandler.keepAlive
  }

  public set keepAlive (value: boolean) {
    this._sessionHandler.keepAlive = value
  }

  public get refreshToken () {
    return this._sessionHandler.refreshToken
  }

  public get onRefreshTokenChangeEvent () {
    return this._sessionHandler.onRefreshTokenChangeEvent
  }

  public close () {
    this._sessionHandler.close()
  }

  public async logout () {
    await this._sessionHandler.logout()
  }

  get user () {
    return this._user
  }
}
