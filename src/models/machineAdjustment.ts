import { ListMeta, Model, ModelList } from '../model'
import { StrengthMachineModel } from '../models/strengthMachine'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface MachineAdjustmentData {
  id: number
  userId: number
  model: StrengthMachineModel
  seat: string
  start: string
  stop: string
  leftPosition: string
  rightPosition: string
}

export enum MachineAdjustmentSorting {
  ID = 'id'
}

export interface MachineAdjustmentListResponseMeta extends ListMeta {
  model?: string
  sort: MachineAdjustmentSorting
}

export interface MachineAdjustmentResponse extends AuthenticatedResponse {
  machineAdjustment: MachineAdjustmentData
}

export interface MachineAdjustmentListResponse extends AuthenticatedResponse {
  machineAdjustments: MachineAdjustmentData[]
  machineAdjustmentsMeta: MachineAdjustmentListResponseMeta
}

export class MachineAdjustments extends ModelList<MachineAdjustment, MachineAdjustmentData, MachineAdjustmentListResponseMeta> {
  constructor (machineAdjustments: MachineAdjustmentData[], machineAdjustmentsMeta: MachineAdjustmentListResponseMeta, sessionHandler: SessionHandler) {
    super(MachineAdjustment, machineAdjustments, machineAdjustmentsMeta, sessionHandler)
  }
}

export class MachineAdjustment extends Model {
  private _machineAdjustmentData: MachineAdjustmentData

  constructor (machineAdjustmentData: MachineAdjustmentData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._machineAdjustmentData = machineAdjustmentData
  }

  protected setMachineAdjustment (machineAdjustmentData: MachineAdjustmentData) {
    this._machineAdjustmentData = machineAdjustmentData
  }

  async reload () {
    const { machineAdjustment } = await this.action('machineAdjustment:show', { id: this._machineAdjustmentData.id }) as MachineAdjustmentResponse
    this.setMachineAdjustment(machineAdjustment)
    return this
  }

  async update (options: { seat?: string, start?: string, stop?: string, leftPosition?: string, rightPosition?: string }) {
    const { machineAdjustment } = await this.action('machineAdjustment:update', { ...options, id: this.id, userId: this.userId }) as MachineAdjustmentResponse
    this.setMachineAdjustment(machineAdjustment)
    return this
  }

  async delete () {
    await this.action('machineAdjustment:delete', { id: this.id, userId: this.userId })
  }

  ejectData () {
    return this.eject(this._machineAdjustmentData)
  }

  get id () {
    return this._machineAdjustmentData.id
  }

  get userId () {
    return this._machineAdjustmentData.userId
  }

  get model () {
    return this._machineAdjustmentData.model
  }

  get seat () {
    return this._machineAdjustmentData.seat
  }

  get start () {
    return this._machineAdjustmentData.start
  }

  get stop () {
    return this._machineAdjustmentData.stop
  }

  get leftPosition () {
    return this._machineAdjustmentData.leftPosition
  }

  get rightPosition () {
    return this._machineAdjustmentData.rightPosition
  }
}
