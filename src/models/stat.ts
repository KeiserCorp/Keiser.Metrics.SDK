import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum StatSorting {
  ID = 'id',
  CreatedAt = 'createdAt'
}

export interface StatData {
  id: number
  createdAt: string
  users: number
  msApps: number
  sessions: number
  oauths: number
  facebook: number
  google: number
  apple: number
  trainingpeaks: number
  strava: number
  inbody: number
}

export interface StatListResponse extends AuthenticatedResponse {
  stats: StatData[]
  statsMeta: StatListResponseMeta
}

export interface StatListResponseMeta extends ListMeta {
  from?: string
  to?: string
  sort: StatSorting
}

export class Stats extends ModelList<Stat, StatData, StatListResponseMeta> {
  constructor (stats: StatData[], statsMeta: StatListResponseMeta, sessionHandler: SessionHandler) {
    super(Stat, stats, statsMeta, sessionHandler)
  }
}

export class Stat extends Model {
  protected _statData: StatData

  constructor (statData: StatData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._statData = statData
  }

  protected setStatData (statData: StatData) {
    this._statData = statData
  }

  get id () {
    return this._statData.id
  }

  get createdAt () {
    return new Date(this._statData.createdAt)
  }

  get users () {
    return this._statData.users
  }

  get msApps () {
    return this._statData.msApps
  }

  get sessions () {
    return this._statData.sessions
  }

  get oauths () {
    return this._statData.oauths
  }

  get facebook () {
    return this._statData.facebook
  }

  get google () {
    return this._statData.google
  }

  get apple () {
    return this._statData.apple
  }

  get trainingpeaks () {
    return this._statData.trainingpeaks
  }

  get strava () {
    return this._statData.strava
  }

  get inbody () {
    return this._statData.inbody
  }
}
