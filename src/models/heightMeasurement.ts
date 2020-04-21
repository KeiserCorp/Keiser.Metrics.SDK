import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

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
}

export class HeightMeasurement extends Model {
  private _heightMeasurementData: HeightMeasurementData
  private _userId: number

  constructor (heightMeasurementData: HeightMeasurementData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._heightMeasurementData = heightMeasurementData
    this._userId = userId
  }

  private setHeightMeasurementData (heightMeasurementData: HeightMeasurementData) {
    Object.assign(this._heightMeasurementData, heightMeasurementData)
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
