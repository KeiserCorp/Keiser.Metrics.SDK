import { Model } from '../model'
import { AuthenticatedResponse } from '../session'

export interface StatsData {
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

export interface StatsResponse extends AuthenticatedResponse {
  stats: StatsData[]
}

export class Stats extends Model {
  async getLatestStats () {
    const { stats } = await this.action('stats:list', { limit: 1 }) as StatsResponse
    return stats[0]
  }

  async getStats (params: {from?: Date, to?: Date, limit?: number, offset?: number, ascending?: boolean} = { limit: 20 }) {
    const { stats } = await this.action('stats:list', params) as StatsResponse
    return stats
  }
}
