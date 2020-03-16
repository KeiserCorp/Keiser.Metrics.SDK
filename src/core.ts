import { MetricsConnection } from './connection'

export interface DocsResponse {
  documentation: any
}

export interface HealthResponse {
  healthy: boolean
}

export interface StatsResponse {
  stats: {
    id: number
    createdAt: Date
    users: number
    msApps: number
    sessions: number
    oauths: number
    facebook: number
    google: number
    trainingpeaks: number
    strava: number
    inbody: number
  }
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

  public docs () {
    return this._connection.action('core:docs') as Promise<DocsResponse>
  }

  public health () {
    return this._connection.action('core:health') as Promise<HealthResponse>
  }

  public stats () {
    // Require Admin Access
    return this._connection.action('core:stats') as Promise<StatsResponse>
  }

  public status () {
    return this._connection.action('core:status') as Promise<StatusResponse>
  }
}
