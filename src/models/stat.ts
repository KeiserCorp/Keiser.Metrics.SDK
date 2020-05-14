import { BaseModelList, ListMeta, Model } from '../model'
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
  trainingpeaks: number
  strava: number
  inbody: number
}

export interface StatListResponse extends AuthenticatedResponse {
  stats: StatData[]
  statsMeta: StatListResponseMeta
}

export interface StatListResponseMeta extends ListMeta {
  from: Date | undefined
  to: Date | undefined
  sort: StatSorting
}

export class Stats extends BaseModelList<Stat, StatData, StatListResponseMeta> {
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
