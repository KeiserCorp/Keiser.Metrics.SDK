import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementData } from './mSeriesFtpMeasurement'
import { Session, SessionData } from './session'

export const enum MSeriesDataSetSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt'
}

export interface MSeriesDataSetData {
  id: number
  source: string | null
  startedAt: string
  endedAt: string
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
  duration: number
  initialOffset: number
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

export interface MSeriesDataSetListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  source: string
  sort: MSeriesDataSetSorting
}

export class MSeriesDataSets extends UserModelList<MSeriesDataSet, MSeriesDataSetData, MSeriesDataSetListResponseMeta> {
  constructor (mSeriesDataSets: MSeriesDataSetData[], mSeriesDataSetsMeta: MSeriesDataSetListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(MSeriesDataSet, mSeriesDataSets, mSeriesDataSetsMeta, sessionHandler, userId)
  }
}

export class MSeriesDataSet extends Model {
  private _mSeriesDataSetData: MSeriesDataSetData
  private _userId: number

  constructor (mSeriesDataSetData: MSeriesDataSetData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._mSeriesDataSetData = mSeriesDataSetData
    this._userId = userId
  }

  private setMSeriesDataSet (mSeriesDataSetData: MSeriesDataSetData) {
    this._mSeriesDataSetData = mSeriesDataSetData
  }

  async reload (options: {graphResolution?: number} = { graphResolution: 200 }) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:show', { userId: this._userId, id: this.id, graph: options.graphResolution }) as MSeriesDataSetResponse
    this.setMSeriesDataSet(mSeriesDataSet)
    return this
  }

  // To-Do: Decide if `update` method is necessary

  async delete () {
    await this.action('mSeriesDataSet:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._mSeriesDataSetData.id
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

  get ordinalId () {
    return this._mSeriesDataSetData.ordinalId
  }

  get buildMajor () {
    return this._mSeriesDataSetData.buildMajor
  }

  get buildMinor () {
    return this._mSeriesDataSetData.buildMinor
  }

  get maxCadence () {
    return this._mSeriesDataSetData.maxCadence
  }

  get averageCadence () {
    return this._mSeriesDataSetData.averageCadence
  }

  get maxPower () {
    return this._mSeriesDataSetData.maxPower
  }

  get averagePower () {
    return this._mSeriesDataSetData.averagePower
  }

  get energyOutput () {
    return this._mSeriesDataSetData.energyOutput
  }

  get caloricBurn () {
    return this._mSeriesDataSetData.caloricBurn
  }

  get distance () {
    return this._mSeriesDataSetData.distance
  }

  get averageMetabolicEquivalent () {
    return this._mSeriesDataSetData.averageMetabolicEquivalent
  }

  get stepCount () {
    return this._mSeriesDataSetData.stepCount
  }

  get duration () {
    return this._mSeriesDataSetData.duration
  }

  get initialOffset () {
    return this._mSeriesDataSetData.initialOffset
  }

  get mSeriesFtpMeasurement () {
    return this._mSeriesDataSetData.mSeriesFtpMeasurement ? new MSeriesFtpMeasurement(this._mSeriesDataSetData.mSeriesFtpMeasurement, this.sessionHandler, this._userId) : undefined
  }

  get graphData () {
    return this._mSeriesDataSetData.graphData ? this._mSeriesDataSetData.graphData.map(mSeriesDataPointData => new MSeriesDataPoint(mSeriesDataPointData)) : undefined
  }

  get Session () {
    return this._mSeriesDataSetData.session ? new Session(this._mSeriesDataSetData.session, this.sessionHandler, this._userId) : undefined
  }

}

export interface MSeriesDataPointData {
  takenAt: string
  realTime: boolean
  interval: number
  cadence: number
  power: number
  caloricBurn: number
  duration: number
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
  duration: number
  distance: number
  gear?: number
  metabolicEquivalent?: number
  stepCount?: number
}

export class MSeriesDataPoint {
  private _mSeriesDataPointData: MSeriesDataPointData

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

  get duration () {
    return this._mSeriesDataPointData.duration
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
