import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { User, UserData } from './user'
import { Facility, FacilityData } from './facility'
import { WeightMeasurement, WeightMeasurementData } from './weightMeasurement'
import { HeightMeasurement, HeightMeasurementData } from './heightMeasurement'

export interface SessionData {
  id: number
  echipId: string | null
  hash: string
  startedAt: string
  endedAt: string | null
  user?: UserData
  facility?: FacilityData

  sessionPlanSequenceInstance?: any
  heartRateDataSets?: any[]
  mSeriesDataSets?: any[]
  strengthMachineDataSets?: any[]

  heightMeasurement?: HeightMeasurementData
  weightMeasurement?: WeightMeasurementData
}

export interface SessionResponse extends AuthenticatedResponse {
  session: SessionData
}

export interface SessionListResponse extends AuthenticatedResponse {
  sessions: SessionData[]
}

export class Session extends Model {
  private _sessionData: SessionData
  private _userId: number

  constructor (sessionData: SessionData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._sessionData = sessionData
    this._userId = userId
  }

  private setSessionData (session: SessionData) {
    Object.assign(this._sessionData, session)
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
    return this._sessionData.endedAt ? new Date(this._sessionData.startedAt) : null
  }

  get user () {
    return this._sessionData.user ? new User(this._sessionData.user, this.sessionHandler) : undefined
  }

  get facility () {
    return this._sessionData.facility ? new Facility(this._sessionData.facility, this.sessionHandler) : undefined
  }

  get heightMeasurement () {
    return this._sessionData.heightMeasurement ? new HeightMeasurement(this._sessionData.heightMeasurement, this._userId, this.sessionHandler) : undefined
  }

  get weightMeasurement () {
    return this._sessionData.weightMeasurement ? new WeightMeasurement(this._sessionData.weightMeasurement, this._userId, this.sessionHandler) : undefined
  }
}
