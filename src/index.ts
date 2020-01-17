import { DEFAULT_ENDPOINT } from './constants'
import { ConnectionOptions } from './interfaces'

export default class MetricsConnection {
  public readonly endpoint: string

  constructor (options: ConnectionOptions) {
    this.endpoint = options.endpoint || DEFAULT_ENDPOINT
  }
}
