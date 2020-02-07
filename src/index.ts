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
}
