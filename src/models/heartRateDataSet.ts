import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Session, SessionData } from './session'

export enum HeartRateDataSetSorting {
  ID = 'id',
  StartedAt = 'startedAt',
  EndedAt = 'endedAt',
  Source = 'source',
  MaxHeartRate = 'maxHeartRate',
  AverageHeartRate = 'averageHeartRate'
}

export interface HeartRateDataSetData {
  id: number
  source: string | null
  startedAt: string
  endedAt: string
  maxHeartRate: number
  averageHeartRate: number
  graphData?: HeartRateDataPointData[]
  session?: SessionData
}

export interface HeartRateDataSetResponse extends AuthenticatedResponse {
  heartRateDataSet: HeartRateDataSetData
}

export interface HeartRateDataSetListResponse extends AuthenticatedResponse {
  heartRateDataSets: HeartRateDataSetData[]
  heartRateDataSetsMeta: HeartRateDataSetListResponseMeta
}

export interface HeartRateDataSetListResponseMeta extends ListMeta {
  from?: string
  to?: string
  source?: string
  sort: HeartRateDataSetSorting
}

export class HeartRateDataSets extends ModelList<HeartRateDataSet, HeartRateDataSetData, HeartRateDataSetListResponseMeta> {
  constructor (heartRateDataSets: HeartRateDataSetData[], heartRateDataSetsMeta: HeartRateDataSetListResponseMeta, sessionHandler: SessionHandler) {
    super(HeartRateDataSet, heartRateDataSets, heartRateDataSetsMeta, sessionHandler)
  }
}

export class HeartRateDataSet extends Model {
  private _heartRateDataSetData: HeartRateDataSetData
  private _graphData?: HeartRateDataPoint[]

  constructor (heartRateDataSetData: HeartRateDataSetData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._heartRateDataSetData = heartRateDataSetData
    this._graphData = typeof this._heartRateDataSetData.graphData !== 'undefined' ? this._heartRateDataSetData.graphData.map(heartRateDataPointData => new HeartRateDataPoint(heartRateDataPointData)) : undefined
  }

  private setHeartRateDataSet (heartRateDataSetData: HeartRateDataSetData) {
    this._heartRateDataSetData = heartRateDataSetData
    this._graphData = typeof this._heartRateDataSetData.graphData !== 'undefined' ? this._heartRateDataSetData.graphData.map(heartRateDataPointData => new HeartRateDataPoint(heartRateDataPointData)) : undefined
  }

  async reload (options: { graphResolution?: number } = { graphResolution: 200 }) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:show', { id: this.id, graph: options.graphResolution }) as HeartRateDataSetResponse
    this.setHeartRateDataSet(heartRateDataSet)
    return this
  }

  async delete () {
    await this.action('heartRateDataSet:delete', { id: this.id })
  }

  get id () {
    return this._heartRateDataSetData.id
  }

  get source () {
    return this._heartRateDataSetData.source
  }

  get startedAt () {
    return new Date(this._heartRateDataSetData.startedAt)
  }

  get endedAt () {
    return new Date(this._heartRateDataSetData.endedAt)
  }

  /**
   * @returns Maximum heart rate in BPM
   */
  get maxHeartRate () {
    return this._heartRateDataSetData.maxHeartRate
  }

  /**
   * @returns Average heart rate in BPM
   */
  get averageHeartRate () {
    return this._heartRateDataSetData.averageHeartRate
  }

  get graphData () {
    return this._graphData
  }

  eagerSession () {
    return typeof this._heartRateDataSetData.session !== 'undefined' ? new Session(this._heartRateDataSetData.session, this.sessionHandler) : undefined
  }
}

export interface HeartRateDataPointData {
  takenAt: string
  heartRate: number
}

export interface HeartRateCapturedDataPoint {
  takenAt: Date
  heartRate: number
}

export class HeartRateDataPoint {
  private readonly _heartRateDataPointData: HeartRateDataPointData

  constructor (heartRateDataPointData: HeartRateDataPointData) {
    this._heartRateDataPointData = heartRateDataPointData
  }

  get takenAt () {
    return new Date(this._heartRateDataPointData.takenAt)
  }

  /**
   * @returns Heart rate in BPM
   */
  get heartRate () {
    return this._heartRateDataPointData.heartRate
  }
}
