import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { StrengthExercise, StrengthExerciseData, StrengthExerciseResponse } from './strengthExercise'

export enum StrengthMachineLine {
  A250 = 'a250',
  A300 = 'a300',
  A350 = 'a350',
  Infinity = 'infinity',
  PowerRack = 'powerRack',
  A500 = 'a500'
}

export enum StrengthMachineSorting {
  ID = 'id',
  Name = 'name',
  Line = 'line'
}

export interface StrengthMachineIdentifier {
  machineModel: string
  firmwareVersion: string
  softwareVersion: string
  mainBoardSerial: string
  displayUUID: string
  leftCylinderSerial: string
  rightCylinderSerial: string | null
}

export interface StrengthMachineModelData {
  model: string
}

export interface StrengthMachineData {
  id: number
  name: string
  line: StrengthMachineLine
  variant: string
  dualSided: boolean
  defaultStrengthExerciseId: number
  defaultStrengthExercise?: StrengthExerciseData
  models?: StrengthMachineModelData[]
}

export interface StrengthMachineResponse extends AuthenticatedResponse {
  strengthMachine: StrengthMachineData
}

export interface StrengthMachineListResponse extends AuthenticatedResponse {
  strengthMachines: StrengthMachineData[]
  strengthMachinesMeta: StrengthMachineListResponseMeta
}

export interface StrengthMachineListResponseMeta extends ListMeta {
  name?: string
  line?: string
  variant?: string
  sort: StrengthMachineSorting
}

export class StrengthMachines extends ModelList<StrengthMachine, StrengthMachineData, StrengthMachineListResponseMeta> {
  constructor (strengthMachines: StrengthMachineData[], strengthMachinesMeta: StrengthMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthMachine, strengthMachines, strengthMachinesMeta, sessionHandler)
  }
}

export class StrengthMachine extends Model {
  private _strengthMachineData: StrengthMachineData
  private _models: StrengthMachineModel[]

  constructor (strengthMachineData: StrengthMachineData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineData = strengthMachineData
    this._models = typeof this._strengthMachineData.models !== 'undefined' ? this._strengthMachineData.models.map(model => new StrengthMachineModel(model)) : []
  }

  protected setStrengthMachineData (strengthMachineData: StrengthMachineData) {
    this._strengthMachineData = strengthMachineData
    this._models = typeof this._strengthMachineData.models !== 'undefined' ? this._strengthMachineData.models.map(model => new StrengthMachineModel(model)) : []
  }

  async reload () {
    const { strengthMachine } = await this.action('strengthMachine:show', { id: this._strengthMachineData.id }) as StrengthMachineResponse
    this.setStrengthMachineData(strengthMachine)
    return this
  }

  get id () {
    return this._strengthMachineData.id
  }

  get name () {
    return this._strengthMachineData.name
  }

  get line () {
    return this._strengthMachineData.line
  }

  get variant () {
    return this._strengthMachineData.variant
  }

  get dualSided () {
    return this._strengthMachineData.dualSided
  }

  get models () {
    return this._models
  }

  eagerDefaultStrengthExercise () {
    return typeof this._strengthMachineData.defaultStrengthExercise !== 'undefined' ? new StrengthExercise(this._strengthMachineData.defaultStrengthExercise, this.sessionHandler) : undefined
  }

  async getDefaultStrengthExercise () {
    const { strengthExercise } = await this.action('strengthExercise:show', { id: this._strengthMachineData.defaultStrengthExerciseId }) as StrengthExerciseResponse
    return new StrengthExercise(strengthExercise, this.sessionHandler)
  }
}

export class StrengthMachineModel {
  private readonly _strengthMachineModelData: StrengthMachineModelData

  constructor (strengthMachineModelData: StrengthMachineModelData) {
    this._strengthMachineModelData = strengthMachineModelData
  }

  get model () {
    return this._strengthMachineModelData.model
  }
}
