import {  } from './constants'
import { MetricsConnection, ConnectionOptions } from './connection'
import { Core } from './core'

export default class Metrics {
  private readonly _connection: MetricsConnection
  private readonly _core: Core

  constructor (options: ConnectionOptions = {}) {
    this._connection = new MetricsConnection(options)
    this._core = new Core(this._connection)
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
}
