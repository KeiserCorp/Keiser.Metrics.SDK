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

  async health () {
    return await this._connection.action('core:health') as HealthResponse
  }

  async status () {
    return await this._connection.action('core:status') as StatusResponse
  }
}
