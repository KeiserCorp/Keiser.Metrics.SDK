import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum HeightMeasurementSorting {
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
  from?: string
  to?: string
  sort: HeightMeasurementSorting
}

export class HeightMeasurements extends ModelList<HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponseMeta> {
  constructor (heightMeasurements: HeightMeasurementData[], heightMeasurementsMeta: HeightMeasurementListResponseMeta, sessionHandler: SessionHandler) {
    super(HeightMeasurement, heightMeasurements, heightMeasurementsMeta, sessionHandler)
  }
}

export class HeightMeasurement extends Model {
  private _heightMeasurementData: HeightMeasurementData

  constructor (heightMeasurementData: HeightMeasurementData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._heightMeasurementData = heightMeasurementData
  }

  private setHeightMeasurementData (heightMeasurementData: HeightMeasurementData) {
    this._heightMeasurementData = heightMeasurementData
  }

  async reload () {
    const { heightMeasurement } = await this.action('heightMeasurement:show', { id: this.id }) as HeightMeasurementResponse
    this.setHeightMeasurementData(heightMeasurement)
    return this
  }

  async delete () {
    await this.action('heightMeasurement:delete', { id: this.id })
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

  /**
   * @returns Height in centimeters
   */
  get metricHeight () {
    return this._heightMeasurementData.metricHeight
  }

  /**
   * @returns Height in inches
   */
  get imperialHeight () {
    return this._heightMeasurementData.imperialHeight
  }
}
