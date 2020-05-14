import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum HeightMeasurementSorting {
  ID = 'id',
  Source = 'source',
  TakenAt = 'takenAt'
}

export interface HeightMeasurementData {
  id: number
  source: string
  takenAt: string
  metricHeight: number
  imperialHeight: number
}

export interface HeightMeasurementResponse extends AuthenticatedResponse {
  heightMeasurement: HeightMeasurementData
}

export interface HeightMeasurementListResponse extends AuthenticatedResponse {
  heightMeasurements: HeightMeasurementData[]
  heightMeasurementsMeta: HeightMeasurementListResponseMeta
}

export interface HeightMeasurementListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  sort: HeightMeasurementSorting
}

export class HeightMeasurements extends UserModelList<HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponseMeta> {
  constructor (heightMeasurements: HeightMeasurementData[], heightMeasurementsMeta: HeightMeasurementListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(HeightMeasurement, heightMeasurements, heightMeasurementsMeta, sessionHandler, userId)
  }
}

export class HeightMeasurement extends Model {
  private _heightMeasurementData: HeightMeasurementData
  private _userId: number

  constructor (heightMeasurementData: HeightMeasurementData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._heightMeasurementData = heightMeasurementData
    this._userId = userId
  }

  private setHeightMeasurementData (heightMeasurementData: HeightMeasurementData) {
    this._heightMeasurementData = heightMeasurementData
  }

  async reload () {
    const { heightMeasurement } = await this.action('heightMeasurement:show', { userId: this._userId, id: this.id }) as HeightMeasurementResponse
    this.setHeightMeasurementData(heightMeasurement)
    return this
  }

  async delete () {
    await this.action('heightMeasurement:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._heightMeasurementData.id
  }

  get source () {
    return this._heightMeasurementData.source
  }

  get takenAt () {
    return new Date(this._heightMeasurementData.takenAt)
  }

  get metricHeight () {
    return this._heightMeasurementData.metricHeight
  }

  get imperialHeight () {
    return this._heightMeasurementData.imperialHeight
  }
}
