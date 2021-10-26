import { SubscribableModel, SubscribableModelList, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum HeightMeasurementSorting {
  ID = 'id',
  Source = 'source',
  TakenAt = 'takenAt'
}

export interface HeightMeasurementData {
  id: number
  userId: number
  source: string
  takenAt: string
  metricHeight: number
}

export interface HeightMeasurementResponse extends AuthenticatedResponse {
  heightMeasurement: HeightMeasurementData
}

export interface HeightMeasurementListResponse extends AuthenticatedResponse {
  heightMeasurements: HeightMeasurementData[]
  heightMeasurementsMeta: HeightMeasurementListResponseMeta
}

export interface HeightMeasurementListResponseMeta extends UserListMeta {
  from?: string
  to?: string
  sort: HeightMeasurementSorting
}

export class HeightMeasurements extends SubscribableModelList<HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponseMeta> {
  constructor (heightMeasurements: HeightMeasurementData[], heightMeasurementsMeta: HeightMeasurementListResponseMeta, sessionHandler: SessionHandler) {
    super(HeightMeasurement, heightMeasurements, heightMeasurementsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'heightMeasurement' }
  }
}

export class HeightMeasurement extends SubscribableModel {
  private _heightMeasurementData: HeightMeasurementData

  constructor (heightMeasurementData: HeightMeasurementData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._heightMeasurementData = heightMeasurementData
  }

  private setHeightMeasurementData (heightMeasurementData: HeightMeasurementData) {
    this._heightMeasurementData = heightMeasurementData
  }

  protected get subscribeParameters () {
    return { model: 'heightMeasurement', id: this.id, userId: this.userId }
  }

  async reload () {
    const { heightMeasurement } = await this.action('heightMeasurement:show', { id: this.id, userId: this.userId }) as HeightMeasurementResponse
    this.setHeightMeasurementData(heightMeasurement)
    return this
  }

  async delete () {
    await this.action('heightMeasurement:delete', { id: this.id, userId: this.userId })
  }

  ejectData () {
    return this.eject(this._heightMeasurementData)
  }

  get id () {
    return this._heightMeasurementData.id
  }

  get userId () {
    return this._heightMeasurementData.userId
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
}
