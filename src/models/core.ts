import { MetricsConnection } from '../connection'

export interface DocsResponse {
  documentation: any
}

export interface HealthResponse {
  healthy: boolean
}

export interface TimeResponse {
  isoDate: string
  unixOffset: number
}

export interface RelativeTimeResponse {
  serverTime: Date
  sentAt: Date
  receivedAt: Date
  roundTripTime: number
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

  async time (): Promise<RelativeTimeResponse> {
    const sentAt = new Date()
    const { unixOffset } = await this._connection.action('core:time') as TimeResponse
    const receivedAt = new Date()
    return { serverTime: new Date(unixOffset), sentAt, receivedAt, roundTripTime: receivedAt.valueOf() - sentAt.valueOf() }
  }
}
