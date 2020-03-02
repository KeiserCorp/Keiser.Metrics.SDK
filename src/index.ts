import {  } from './constants'
import { ConnectionOptions } from './interfaces'
import { MetricsConnection } from './connection'

export default class Metrics {
  private readonly _connection: MetricsConnection

  constructor (options: ConnectionOptions = {}) {
    this._connection = new MetricsConnection(options)
  }

  public get socketConnected () {
    return this._connection.socketConnected
  }

  public get persistConnection () {
    return this._connection.persistConnection
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
