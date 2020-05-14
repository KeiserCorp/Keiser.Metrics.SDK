import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum MSeriesFtpMeasurementSorting {
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
  from: string | undefined
  to: string | undefined
  source: string
  machineType: string
  sort: MSeriesFtpMeasurementSorting
}

export class MSeriesFtpMeasurements extends UserModelList<MSeriesFtpMeasurement, MSeriesFtpMeasurementData, MSeriesFtpMeasurementListResponseMeta> {
  constructor (mSeriesFtpMeasurements: MSeriesFtpMeasurementData[], mSeriesFtpMeasurementsMeta: MSeriesFtpMeasurementListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(MSeriesFtpMeasurement, mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta, sessionHandler, userId)
  }
}

export class MSeriesFtpMeasurement extends Model {
  private _mSeriesFtpMeasurement: MSeriesFtpMeasurementData
  private _userId: number

  constructor (mSeriesFtpMeasurement: MSeriesFtpMeasurementData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._mSeriesFtpMeasurement = mSeriesFtpMeasurement
    this._userId = userId
  }

  private setMSeriesFtpMeasurement (mSeriesFtpMeasurement: MSeriesFtpMeasurementData) {
    this._mSeriesFtpMeasurement = mSeriesFtpMeasurement
  }

  async reload () {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:show', { userId: this._userId, id: this.id }) as MSeriesFtpMeasurementResponse
    this.setMSeriesFtpMeasurement(mSeriesFtpMeasurement)
    return this
  }

  async delete () {
    await this.action('mSeriesFtpMeasurement:delete', { userId: this._userId, id: this.id })
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

  get ftp () {
    return this._mSeriesFtpMeasurement.ftp
  }
}
