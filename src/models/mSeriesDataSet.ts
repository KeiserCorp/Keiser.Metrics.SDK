import { durationToSeconds } from '../lib/time'
import { SubscribableModel, SubscribableModelList, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementData } from './mSeriesFtpMeasurement'
import { Session, SessionData } from './session'

export enum MSeriesDataSetSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt'
}

export interface MSeriesDataSetData {
  id: number
  userId: number
  source: string | null
  startedAt: string
  endedAt: string
  /**
   * @todo Add machine type enum
   */
  machineType: string
  ordinalId: number
  buildMajor: number
  buildMinor: number
  maxCadence: number
  averageCadence: number
  maxPower: number
  averagePower: number
  energyOutput: number
  caloricBurn: number
  distance: number
  averageMetabolicEquivalent: number | null
  stepCount: number | null
  duration: string
  initialOffset: string
  mSeriesFtpMeasurement?: MSeriesFtpMeasurementData
  graphData?: MSeriesDataPointData[]
  session?: SessionData
}

export interface MSeriesDataSetResponse extends AuthenticatedResponse {
  mSeriesDataSet: MSeriesDataSetData
}

export interface MSeriesDataSetListResponse extends AuthenticatedResponse {
  mSeriesDataSets: MSeriesDataSetData[]
  mSeriesDataSetsMeta: MSeriesDataSetListResponseMeta
}

export interface MSeriesDataSetListResponseMeta extends UserListMeta {
  from?: string
  to?: string
  source: string
  sort: MSeriesDataSetSorting
}

export class MSeriesDataSets extends SubscribableModelList<MSeriesDataSet, MSeriesDataSetData, MSeriesDataSetListResponseMeta> {
  constructor (mSeriesDataSets: MSeriesDataSetData[], mSeriesDataSetsMeta: MSeriesDataSetListResponseMeta, sessionHandler: SessionHandler) {
    super(MSeriesDataSet, mSeriesDataSets, mSeriesDataSetsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'mSeriesDataSet' }
  }
}

export class MSeriesDataSet extends SubscribableModel {
  private _mSeriesDataSetData: MSeriesDataSetData
  private _graphData?: MSeriesDataPoint[]

  constructor (mSeriesDataSetData: MSeriesDataSetData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesDataSetData = mSeriesDataSetData
    this._graphData = typeof this._mSeriesDataSetData.graphData !== 'undefined' ? this._mSeriesDataSetData.graphData.map(mSeriesDataPointData => new MSeriesDataPoint(mSeriesDataPointData)) : undefined
  }

  private setMSeriesDataSet (mSeriesDataSetData: MSeriesDataSetData) {
    this._mSeriesDataSetData = mSeriesDataSetData
    this._graphData = typeof this._mSeriesDataSetData.graphData !== 'undefined' ? this._mSeriesDataSetData.graphData.map(mSeriesDataPointData => new MSeriesDataPoint(mSeriesDataPointData)) : undefined
  }

  protected get subscribeParameters () {
    return { model: 'mSeriesDataSet', id: this.id, userId: this.userId }
  }

  async reload (options: { graphResolution?: number } = { graphResolution: 200 }) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:show', { id: this.id, userId: this.userId, graph: options.graphResolution }) as MSeriesDataSetResponse
    this.setMSeriesDataSet(mSeriesDataSet)
    return this
  }

  async delete () {
    await this.action('mSeriesDataSet:delete', { id: this.id, userId: this.userId })
  }

  get id () {
    return this._mSeriesDataSetData.id
  }

  get userId () {
    return this._mSeriesDataSetData.userId
  }

  get source () {
    return this._mSeriesDataSetData.source
  }

  get startedAt () {
    return new Date(this._mSeriesDataSetData.startedAt)
  }

  get endedAt () {
    return new Date(this._mSeriesDataSetData.endedAt)
  }

  get machineType () {
    return this._mSeriesDataSetData.machineType
  }

  /**
   * @returns Number unique to local set of equipment (not universally unique)
   */
  get ordinalId () {
    return this._mSeriesDataSetData.ordinalId
  }

  /**
   * @returns Major portion of firmware's SemVer
   */
  get buildMajor () {
    return this._mSeriesDataSetData.buildMajor
  }

  /**
   * @returns Minor portion of firmware's SemVer
   */
  get buildMinor () {
    return this._mSeriesDataSetData.buildMinor
  }

  /**
   * @returns Maximum cadence in BPM
   */
  get maxCadence () {
    return this._mSeriesDataSetData.maxCadence
  }

  /**
   * @returns Average cadence in BPM
   */
  get averageCadence () {
    return this._mSeriesDataSetData.averageCadence
  }

  /**
   * @returns Maximum power in Watts
   */
  get maxPower () {
    return this._mSeriesDataSetData.maxPower
  }

  /**
   * @returns Average power in Watts
   */
  get averagePower () {
    return this._mSeriesDataSetData.averagePower
  }

  /**
   * @returns Energy produced Joules
   */
  get energyOutput () {
    return this._mSeriesDataSetData.energyOutput
  }

  /**
   * @returns Calories burn in cal (derived from power using simulated flat road ride)
   */
  get caloricBurn () {
    return this._mSeriesDataSetData.caloricBurn
  }

  /**
   * @returns Distance in meters (derived from power using simulated flat road ride)
   */
  get distance () {
    return this._mSeriesDataSetData.distance
  }

  /**
   * @returns Average MET (only valid for M7i data)
   */
  get averageMetabolicEquivalent () {
    return this._mSeriesDataSetData.averageMetabolicEquivalent
  }

  /**
   * @returns Number of steps counted (only valid for M7i data)
   */
  get stepCount () {
    return this._mSeriesDataSetData.stepCount
  }

  /**
   * @returns Duration in number of seconds since start
   */
  get duration () {
    return durationToSeconds(this._mSeriesDataSetData.duration)
  }

  /**
   * @returns Offset in number of seconds between broadcast start and first packet reception
   */
  get initialOffset () {
    return durationToSeconds(this._mSeriesDataSetData.initialOffset)
  }

  get graphData () {
    return this._graphData
  }

  eagerMSeriesFtpMeasurement () {
    return typeof this._mSeriesDataSetData.mSeriesFtpMeasurement !== 'undefined' ? new MSeriesFtpMeasurement(this._mSeriesDataSetData.mSeriesFtpMeasurement, this.sessionHandler) : undefined
  }

  eagerSession () {
    return typeof this._mSeriesDataSetData.session !== 'undefined' ? new Session(this._mSeriesDataSetData.session, this.sessionHandler) : undefined
  }
}

export interface MSeriesDataPointData {
  takenAt: string
  realTime: boolean
  interval: number
  cadence: number
  power: number
  caloricBurn: number
  duration: string
  distance: number
  gear: number | null
  metabolicEquivalent: number | null
  stepCount: number | null
}

export interface MSeriesCapturedDataPoint {
  takenAt: Date
  realTime: boolean
  interval: number
  cadence: number
  power: number
  caloricBurn: number
  duration: string | number
  distance: number
  gear?: number
  metabolicEquivalent?: number
  stepCount?: number
}

export class MSeriesDataPoint {
  private readonly _mSeriesDataPointData: MSeriesDataPointData

  constructor (mSeriesDataPointData: MSeriesDataPointData) {
    this._mSeriesDataPointData = mSeriesDataPointData
  }

  get takenAt () {
    return new Date(this._mSeriesDataPointData.takenAt)
  }

  get takenAtRaw () {
    return this._mSeriesDataPointData.takenAt
  }

  get realTime () {
    return this._mSeriesDataPointData.realTime
  }

  get interval () {
    return this._mSeriesDataPointData.interval
  }

  get cadence () {
    return this._mSeriesDataPointData.cadence
  }

  get power () {
    return this._mSeriesDataPointData.power
  }

  get caloricBurn () {
    return this._mSeriesDataPointData.caloricBurn
  }

  /**
   * @returns Duration in number of seconds since start
   */
  get duration () {
    return durationToSeconds(this._mSeriesDataPointData.duration)
  }

  get distance () {
    return this._mSeriesDataPointData.distance
  }

  get gear () {
    return this._mSeriesDataPointData.gear
  }

  get metabolicEquivalent () {
    return this._mSeriesDataPointData.metabolicEquivalent
  }

  get stepCount () {
    return this._mSeriesDataPointData.stepCount
  }
}
