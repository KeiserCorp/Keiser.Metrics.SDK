import { MetricsConnection, ConnectionOptions } from './connection'
import { Core } from './core'
import { Authentication } from './session'

export default class Metrics {
  private readonly _connection: MetricsConnection
  private readonly _core: Core

  constructor (options: ConnectionOptions = {}) {
    this._connection = new MetricsConnection(options)
    this._core = new Core(this._connection)
  }

  public get onDisposeEvent () {
    return this._connection.onDisposeEvent
  }

  public get socketConnected () {
    return this._connection.socketConnected
  }

  public get persistConnection () {
    return this._connection.persistConnection
  }

  public get core () {
    return this._core
  }

  public dispose () {
    this._connection.dispose()
  }

  public action (action: string, params: Object = {}) {
    return this._connection.action(action, params)
  }

  public get onConnectionChangeEvent () {
    return this._connection.onConnectionChangeEvent
  }

  public async authenticateWithCredentials (email: string, password: string, refreshable: boolean = true) {
    return Authentication.useCredentials(this._connection, email, password, refreshable)
  }

  public async authenticateWithToken (token: string) {
    return Authentication.useToken(this._connection, token)
  }

  public async authenticateWithResetToken (token: string, password: string, refreshable: boolean = true) {
    return Authentication.useResetToken(this._connection, token, password)
  }

  public async authenticateWithOAuth (service: string, redirect: string) {
    return Authentication.useOAuth(this._connection, service, redirect)
  }

  public async createUser (email: string, password: string, refreshable: boolean = true) {
    return Authentication.createUser(this._connection, email, password, refreshable)
  }

  public async passwordReset (email: string) {
    await Authentication.passwordReset(this._connection, email)
  }
}
