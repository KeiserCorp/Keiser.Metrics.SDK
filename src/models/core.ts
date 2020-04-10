import { MetricsConnection } from '../connection'

export interface DocsResponse {
  documentation: any
}

export interface HealthResponse {
  healthy: boolean
}

export interface StatusResponse {
  nodeStatus: string
  problems: string[]
  id: number
  actionheroVersion: string
  uptime: number
  name: string
  description: string
  version: string
}

export class Core {
  private readonly _connection: MetricsConnection

  constructor (connection: MetricsConnection) {
    this._connection = connection
  }

  health () {
    return this._connection.action('core:health') as Promise<HealthResponse>
  }

  status () {
    return this._connection.action('core:status') as Promise<StatusResponse>
  }
}
