import { MetricsConnection, ConnectionOptions } from './connection'
import { Core } from './models/core'
import { Authentication } from './session'
import { OAuthProviders } from './models/user'

export default class Metrics {
  protected readonly _connection: MetricsConnection
  protected readonly _core: Core

  constructor (options: ConnectionOptions = {}) {
    this._connection = new MetricsConnection(options)
    this._core = new Core(this._connection)
  }

  get onDisposeEvent () {
    return this._connection.onDisposeEvent
  }

  get socketConnected () {
    return this._connection.socketConnected
  }

  get persistConnection () {
    return this._connection.persistConnection
  }

  get core () {
    return this._core
  }

  dispose () {
    this._connection.dispose()
  }

  action (action: string, params: Object = {}) {
    return this._connection.action(action, params)
  }

  get onConnectionChangeEvent () {
    return this._connection.onConnectionChangeEvent
  }

  async authenticateWithCredentials (email: string, password: string, refreshable: boolean = true) {
    return Authentication.useCredentials(this._connection, email, password, refreshable)
  }

  async authenticateWithToken (token: string) {
    return Authentication.useToken(this._connection, token)
  }

  async authenticateWithResetToken (token: string, password: string, refreshable: boolean = true) {
    return Authentication.useResetToken(this._connection, token, password)
  }

  async authenticateWithFacebook (redirect: string) {
    return Authentication.useOAuth(this._connection, OAuthProviders.Facebook, redirect)
  }

  async authenticateWithGoogle (redirect: string) {
    return Authentication.useOAuth(this._connection, OAuthProviders.Google, redirect)
  }

  async createUser (email: string, password: string, refreshable: boolean = true) {
    return Authentication.createUser(this._connection, email, password, refreshable)
  }

  async passwordReset (email: string) {
    await Authentication.passwordReset(this._connection, email)
  }
}

export class MetricsAdmin extends Metrics {
  async authenticateAdminWithCredentials (email: string, password: string, token: string, refreshable: boolean = true) {
    return Authentication.useAdminCredentials(this._connection, email, password, token, refreshable)
  }

  async authenticateAdminWithToken (token: string) {
    return Authentication.useAdminToken(this._connection, token)
  }
}
