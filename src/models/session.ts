import { FacilityListMeta, SubscribableModel, SubscribableModelList, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData } from './facility'
import { HeartRateDataSet, HeartRateDataSetData } from './heartRateDataSet'
import { HeightMeasurement, HeightMeasurementData } from './heightMeasurement'
import { MSeriesDataSet, MSeriesDataSetData } from './mSeriesDataSet'
import { StrengthMachineDataSet, StrengthMachineDataSetData } from './strengthMachineDataSet'
import { User, UserData } from './user'
import { WeightMeasurement, WeightMeasurementData } from './weightMeasurement'

export enum SessionSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt'
}

export enum SessionRequireExtendedDataType {
  MSeries = 'mSeries',
  Strength = 'strength',
  HeartRate = 'heartRate',
  Session = 'session',
  Workout = 'workout'
}

export interface SessionData {
  id: number
  userId: number
  echipId: string | null
  hash: string
  startedAt: string
  endedAt: string | null
  user?: UserData
  facility?: FacilityData
  hasMSeriesDataSets: boolean
  hasStrengthMachineDataSets: boolean
  hasHeartRateDataSets: boolean

  /**
   * @todo Add Session Plan Sequence Instance model
   */
  sessionPlanSequenceInstance?: any
  heartRateDataSets?: HeartRateDataSetData[]
  mSeriesDataSets?: MSeriesDataSetData[]
  strengthMachineDataSets?: StrengthMachineDataSetData[]

  heightMeasurement?: HeightMeasurementData
  weightMeasurement?: WeightMeasurementData
}

export interface SessionResponse extends AuthenticatedResponse {
  session: SessionData
}

export interface SessionStartResponse extends SessionResponse {
  /**
   * @todo Define interface for echipData
   */
  echipData: object
}

export interface SessionListResponse extends AuthenticatedResponse {
  sessions: SessionData[]
  sessionsMeta: SessionListResponseMeta
}

export interface FacilitySessionListResponse extends AuthenticatedResponse {
  sessions: SessionData[]
  sessionsMeta: FacilitySessionListResponseMeta
}

export interface SessionListResponseMeta extends UserListMeta {
  from?: string
  to?: string
  open?: boolean
  sort: SessionSorting
}

export interface FacilitySessionListResponseMeta extends FacilityListMeta {
  open?: boolean
  name?: string
  from?: string
  to?: string
  sort: SessionSorting
}

export class Sessions extends SubscribableModelList<Session, SessionData, SessionListResponseMeta> {
  constructor (sessions: SessionData[], sessionsMeta: SessionListResponseMeta, sessionHandler: SessionHandler) {
    super(Session, sessions, sessionsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'session' }
  }
}

export class StaticSession {
  private readonly _sessionData: SessionData

  constructor (sessionData: SessionData) {
    this._sessionData = sessionData
  }

  get id () {
    return this._sessionData.id
  }

  get userId () {
    return this._sessionData.userId
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
    return this._sessionData.endedAt !== null ? new Date(this._sessionData.endedAt) : null
  }

  get user () {
    return this._sessionData.user
  }

  get facility () {
    return this._sessionData.facility
  }

  get hasMSeriesDataSets () {
    return this._sessionData.hasMSeriesDataSets
  }

  get hasStrengthMachineDataSets () {
    return this._sessionData.hasStrengthMachineDataSets
  }

  get hasHeartRateDataSets () {
    return this._sessionData.hasHeartRateDataSets
  }

  get heartRateDataSets () {
    return this._sessionData.heartRateDataSets
  }

  get mSeriesDataSets () {
    return this._sessionData.mSeriesDataSets
  }

  get strengthMachineDataSets () {
    return this._sessionData.strengthMachineDataSets
  }

  get heightMeasurement () {
    return this._sessionData.heightMeasurement
  }

  get weightMeasurement () {
    return this._sessionData.weightMeasurement
  }

  /**
   * @deprecated This endpoint should does not expose a proper model and should will
   * be removed in the next major version release.
   * @hidden
   */
  get sessionPlanSequenceInstance () {
    return this._sessionData.sessionPlanSequenceInstance
  }
}

export class Session extends SubscribableModel {
  private _sessionData: SessionData

  constructor (sessionData: SessionData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._sessionData = sessionData
  }

  protected setSessionData (session: SessionData) {
    this._sessionData = session
  }

  protected get subscribeParameters () {
    return { model: 'session', id: this.id, userId: this.userId }
  }

  async end () {
    const { session } = await this.action('session:end', { id: this.id, userId: this.userId }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async reload () {
    const { session } = await this.action('session:show', { id: this.id, userId: this.userId }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async delete () {
    await this.action('session:delete', { id: this.id, userId: this.userId })
  }

  get id () {
    return this._sessionData.id
  }

  get userId () {
    return this._sessionData.userId
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
    return this._sessionData.endedAt !== null ? new Date(this._sessionData.endedAt) : null
  }

  get hasMSeriesDataSets () {
    return this._sessionData.hasMSeriesDataSets
  }

  get hasStrengthMachineDataSets () {
    return this._sessionData.hasStrengthMachineDataSets
  }

  get hasHeartRateDataSets () {
    return this._sessionData.hasHeartRateDataSets
  }

  /**
   * @deprecated This endpoint should does not expose a proper model and should will
   * be removed in the next major version release.
   * @hidden
   */
  get sessionPlanSequenceInstance () {
    return this._sessionData.sessionPlanSequenceInstance
  }

  eagerUser () {
    return typeof this._sessionData.user !== 'undefined' ? new User(this._sessionData.user, this.sessionHandler) : undefined
  }

  eagerFacility () {
    return typeof this._sessionData.facility !== 'undefined' ? new Facility(this._sessionData.facility, this.sessionHandler) : undefined
  }

  eagerHeartRateDataSets () {
    return typeof this._sessionData.heartRateDataSets !== 'undefined' ? this._sessionData.heartRateDataSets.map(heartRateDataSet => new HeartRateDataSet(heartRateDataSet, this.sessionHandler)) : undefined
  }

  eagerMSeriesDataSets () {
    return typeof this._sessionData.mSeriesDataSets !== 'undefined' ? this._sessionData.mSeriesDataSets.map(mSeriesDataSet => new MSeriesDataSet(mSeriesDataSet, this.sessionHandler)) : undefined
  }

  eagerStrengthMachineDataSets () {
    return typeof this._sessionData.strengthMachineDataSets !== 'undefined' ? this._sessionData.strengthMachineDataSets.map(strengthMachineDataSet => new StrengthMachineDataSet(strengthMachineDataSet, this.sessionHandler)) : undefined
  }

  eagerHeightMeasurement () {
    return typeof this._sessionData.heightMeasurement !== 'undefined' ? new HeightMeasurement(this._sessionData.heightMeasurement, this.sessionHandler) : undefined
  }

  eagerWeightMeasurement () {
    return typeof this._sessionData.weightMeasurement !== 'undefined' ? new WeightMeasurement(this._sessionData.weightMeasurement, this.sessionHandler) : undefined
  }
}

export class FacilitySessions extends SubscribableModelList<FacilitySession, SessionData, FacilitySessionListResponseMeta> {
  constructor (sessions: SessionData[], sessionsMeta: FacilitySessionListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilitySession, sessions, sessionsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'session', actionOverride: 'facilitySession:subscribe' }
  }
}

export class FacilitySession extends Session {
  async end (params: { echipId?: string, echipData?: object } = { }) {
    const { session } = await this.action('facilitySession:end', { id: this.id, echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async update (params: { echipId: string, echipData: object }) {
    const { session } = await this.action('facilitySession:update', { id: this.id, echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async reload () {
    const { session } = await this.action('facilitySession:show', { id: this.id }) as SessionResponse
    this.setSessionData(session)
    return this
  }

  async delete () {
    await this.action('facilitySession:delete', { id: this.id })
  }
}
