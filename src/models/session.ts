import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData } from './facility'
import { HeartRateDataSet, HeartRateDataSetData } from './heartRateDataSet'
import { HeightMeasurement, HeightMeasurementData } from './heightMeasurement'
import { MSeriesDataSet, MSeriesDataSetData } from './mSeriesDataSet'
import { StrengthMachineDataSet, StrengthMachineDataSetData } from './strengthMachineDataSet'
import { User, UserData } from './user'
import { WeightMeasurement, WeightMeasurementData } from './weightMeasurement'

export const enum SessionSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt'
}

export interface SessionData {
  id: number
  echipId: string | null
  hash: string
  startedAt: string
  endedAt: string | null
  user?: UserData
  facility?: FacilityData

  sessionPlanSequenceInstance?: any   // To-Do: Add Session Plan Sequence Instance model
  heartRateDataSets?: HeartRateDataSetData[]
  mSeriesDataSets?: MSeriesDataSetData[]
  strengthMachineDataSets?: StrengthMachineDataSetData[]

  heightMeasurement?: HeightMeasurementData
  weightMeasurement?: WeightMeasurementData
}

export interface SessionResponse extends AuthenticatedResponse {
  session: SessionData
}

export interface SessionListResponse extends AuthenticatedResponse {
  sessions: SessionData[]
  sessionsMeta: SessionListResponseMeta
}

export interface SessionListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  open: boolean | undefined
  sort: SessionSorting
}

export class Sessions extends UserModelList<Session, SessionData, SessionListResponseMeta> {
  constructor (sessions: SessionData[], sessionsMeta: SessionListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(Session, sessions, sessionsMeta, sessionHandler, userId)
  }
}

export class Session extends Model {
  private _sessionData: SessionData
  private _userId: number

  constructor (sessionData: SessionData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._sessionData = sessionData
    this._userId = userId
  }

  private setSessionData (session: SessionData) {
    this._sessionData = session
  }

  async end () {
    const { session } = await this.action('session:end', { userId: this._userId, id: this.id }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async reload () {
    const { session } = await this.action('session:show', { userId: this._userId, id: this.id }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async delete () {
    await this.action('session:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._sessionData.id
  }

  get echipId () {
    return this._sessionData.echipId
  }

  get hash () {
    return this._sessionData.hash
  }

  get startedAt () {
    return new Date(this._sessionData.startedAt)
  }

  get endedAt () {
    return this._sessionData.endedAt ? new Date(this._sessionData.endedAt) : null
  }

  get user () {
    return this._sessionData.user ? new User(this._sessionData.user, this.sessionHandler) : undefined
  }

  get facility () {
    return this._sessionData.facility ? new Facility(this._sessionData.facility, this.sessionHandler) : undefined
  }

  get heartRateDataSets () {
    return this._sessionData.heartRateDataSets ? this._sessionData.heartRateDataSets.map(heartRateDataSet => new HeartRateDataSet(heartRateDataSet, this.sessionHandler, this._userId)) : undefined
  }

  get mSeriesDataSets () {
    return this._sessionData.mSeriesDataSets ? this._sessionData.mSeriesDataSets.map(mSeriesDataSet => new MSeriesDataSet(mSeriesDataSet, this.sessionHandler, this._userId)) : undefined
  }

  get strengthMachineDataSets () {
    return this._sessionData.strengthMachineDataSets ? this._sessionData.strengthMachineDataSets.map(strengthMachineDataSet => new StrengthMachineDataSet(strengthMachineDataSet, this.sessionHandler, this._userId)) : undefined
  }

  get heightMeasurement () {
    return this._sessionData.heightMeasurement ? new HeightMeasurement(this._sessionData.heightMeasurement, this.sessionHandler, this._userId) : undefined
  }

  get weightMeasurement () {
    return this._sessionData.weightMeasurement ? new WeightMeasurement(this._sessionData.weightMeasurement, this.sessionHandler, this._userId) : undefined
  }
}
