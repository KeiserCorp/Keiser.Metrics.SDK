import { SimpleEventDispatcher } from 'ste-simple-events'
import { MetricsConnection } from './connection'
import { User, UserResponse } from './models/user'

export interface AuthenticatedResponse {
  accessToken: string
  refreshToken?: string
}

export interface LoginResponse extends AuthenticatedResponse {
  user: UserResponse
}

export interface RefreshTokenChangeEvent {
  refreshToken: string
}

export class Authentication {
  static async useCredentials (connection: MetricsConnection, email: string, password: string, refreshable: boolean = true) {
    const response = await connection.action('auth:login', { email, password, refreshable }) as LoginResponse
    return new Session(response, connection)
  }
}

export class SessionHandler {
  private _connection: MetricsConnection
  private _accessToken: string
  private _refreshToken: string | null
  private _onRefreshTokenChangeEvent = new SimpleEventDispatcher<RefreshTokenChangeEvent>()

  constructor (connection: MetricsConnection, loginResponse: LoginResponse) {
    this._connection = connection
    this._accessToken = loginResponse.accessToken
    this._refreshToken = loginResponse.refreshToken ?? null
  }

  public get onRefreshTokenChangeEvent () {
    return this._onRefreshTokenChangeEvent.asEvent()
  }

  public async action (action: string, params: Object = {}) {
    const response = await this._connection.action(action, params) as AuthenticatedResponse
    this._accessToken = response.accessToken
    if (response.refreshToken) {
      this._refreshToken = response.refreshToken
    }
    return response as unknown
  }

  public get accessToken () {
    return this._accessToken
  }

  public get refreshToken () {
    return this._refreshToken
  }
}

export class Session {
  private _sessionHandler: SessionHandler
  private _user: User

  constructor (loginResponse: LoginResponse, connection: MetricsConnection) {
    this._sessionHandler = new SessionHandler(connection, loginResponse)
    this._user = new User(loginResponse.user, this._sessionHandler)
  }

  public get onRefreshTokenChangeEvent () {
    return this._sessionHandler.onRefreshTokenChangeEvent
  }

  get user () {
    return this._user
  }
}
