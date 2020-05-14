import { ListMeta, Model, UserModelList } from '../model'
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
  source: string | undefined
  sort: HeartRateDataSetSorting
}

export class HeartRateDataSets extends UserModelList<HeartRateDataSet, HeartRateDataSetData, HeartRateDataSetListResponseMeta> {
  constructor (heartRateDataSets: HeartRateDataSetData[], heartRateDataSetsMeta: HeartRateDataSetListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(HeartRateDataSet, heartRateDataSets, heartRateDataSetsMeta, sessionHandler, userId)
  }
}

export class HeartRateDataSet extends Model {
  private _heartRateDataSetData: HeartRateDataSetData
  private _userId: number

  constructor (heartRateDataSetData: HeartRateDataSetData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._heartRateDataSetData = heartRateDataSetData
    this._userId = userId
  }

  private setHeartRateDataSet (heartRateDataSetData: HeartRateDataSetData) {
    this._heartRateDataSetData = heartRateDataSetData
  }

  async reload (options: {graphResolution?: number} = { graphResolution: 200 }) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:show', { userId: this._userId, id: this.id, graph: options.graphResolution }) as HeartRateDataSetResponse
    this.setHeartRateDataSet(heartRateDataSet)
    return this
  }

  // To-Do: Decide if `update` method is necessary

  async delete () {
    await this.action('heartRateDataSet:delete', { userId: this._userId, id: this.id })
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

  get maxHeartRate () {
    return this._heartRateDataSetData.maxHeartRate
  }

  get averageHeartRate () {
    return this._heartRateDataSetData.averageHeartRate
  }

  get graphData () {
    return this._heartRateDataSetData.graphData ? this._heartRateDataSetData.graphData.map(heartRateDataPointData => new HeartRateDataPoint(heartRateDataPointData)) : undefined
  }

  get Session () {
    return this._heartRateDataSetData.session ? new Session(this._heartRateDataSetData.session, this.sessionHandler, this._userId) : undefined
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
  private _heartRateDataPointData: HeartRateDataPointData

  constructor (heartRateDataPointData: HeartRateDataPointData) {
    this._heartRateDataPointData = heartRateDataPointData
  }

  get takenAt () {
    return new Date(this._heartRateDataPointData.takenAt)
  }

  get heartRate () {
    return this._heartRateDataPointData.heartRate
  }
}
