import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum MSeriesFtpMeasurementSorting {
  ID = 'id',
  TakenAt = 'takenAt',
  Source = 'source'
}

export interface MSeriesFtpMeasurementData {
  id: number
  source: string | null
  takenAt: string
  machineType: string
  ftp: number
}

export interface MSeriesFtpMeasurementResponse extends AuthenticatedResponse {
  mSeriesFtpMeasurement: MSeriesFtpMeasurementData
}

export interface MSeriesFtpMeasurementListResponse extends AuthenticatedResponse {
  mSeriesFtpMeasurements: MSeriesFtpMeasurementData[]
  mSeriesFtpMeasurementsMeta: MSeriesFtpMeasurementListResponseMeta
}

export interface MSeriesFtpMeasurementListResponseMeta extends ListMeta {
  from?: string
  to?: string
  source: string
  machineType: string
  sort: MSeriesFtpMeasurementSorting
}

export class MSeriesFtpMeasurements extends ModelList<MSeriesFtpMeasurement, MSeriesFtpMeasurementData, MSeriesFtpMeasurementListResponseMeta> {
  constructor (mSeriesFtpMeasurements: MSeriesFtpMeasurementData[], mSeriesFtpMeasurementsMeta: MSeriesFtpMeasurementListResponseMeta, sessionHandler: SessionHandler) {
    super(MSeriesFtpMeasurement, mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta, sessionHandler)
  }
}

export class MSeriesFtpMeasurement extends Model {
  private _mSeriesFtpMeasurement: MSeriesFtpMeasurementData

  constructor (mSeriesFtpMeasurement: MSeriesFtpMeasurementData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._mSeriesFtpMeasurement = mSeriesFtpMeasurement
  }

  private setMSeriesFtpMeasurement (mSeriesFtpMeasurement: MSeriesFtpMeasurementData) {
    this._mSeriesFtpMeasurement = mSeriesFtpMeasurement
  }

  async reload () {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:show', { id: this.id }) as MSeriesFtpMeasurementResponse
    this.setMSeriesFtpMeasurement(mSeriesFtpMeasurement)
    return this
  }

  async delete () {
    await this.action('mSeriesFtpMeasurement:delete', { id: this.id })
  }

  get id () {
    return this._mSeriesFtpMeasurement.id
  }

  get source () {
    return this._mSeriesFtpMeasurement.source
  }

  get takenAt () {
    return new Date(this._mSeriesFtpMeasurement.takenAt)
  }

  get machineType () {
    return this._mSeriesFtpMeasurement.machineType
  }

  /**
   * @returns Functional Threshold Power in Watts
   */
  get ftp () {
    return this._mSeriesFtpMeasurement.ftp
  }
}
