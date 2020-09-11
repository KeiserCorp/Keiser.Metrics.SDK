import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Exercise, ExerciseData } from './exercise'

export const enum StrengthMachineLine {
  A250 = 'a250',
  A300 = 'a300',
  A350 = 'a350',
  Infinity = 'infinity',
  PowerRack = 'powerRack',
  A500 = 'a500'
}

export const enum StrengthMachineSorting {
  ID = 'id',
  Name = 'name',
  Line = 'line'
}

export interface StrengthMachineData {
  id: number
  name: string
  line: StrengthMachineLine
  variant: string
  dualSided: boolean
  exercise?: ExerciseData
}

export interface StrengthMachineResponse extends AuthenticatedResponse {
  strengthMachine: StrengthMachineData
}

export interface StrengthMachineListResponse extends AuthenticatedResponse {
  strengthMachines: StrengthMachineData[]
  strengthMachinesMeta: StrengthMachineListResponseMeta
}

export interface StrengthMachineListResponseMeta extends ListMeta {
  name: string | undefined
  line: string | undefined
  variant: string | undefined
  sort: StrengthMachineSorting
}

export class StrengthMachines extends ModelList<StrengthMachine, StrengthMachineData, StrengthMachineListResponseMeta> {
  constructor (strengthMachines: StrengthMachineData[], strengthMachinesMeta: StrengthMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthMachine, strengthMachines, strengthMachinesMeta, sessionHandler)
  }
}

export class StrengthMachine extends Model {
  private _strengthMachineData: StrengthMachineData

  constructor (strengthMachineData: StrengthMachineData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineData = strengthMachineData
  }

  protected setStrengthMachineData (strengthMachineData: StrengthMachineData) {
    this._strengthMachineData = strengthMachineData
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

  get exercise () {
    return this._strengthMachineData.exercise ? new Exercise(this._strengthMachineData.exercise, this.sessionHandler) : undefined
  }
}

/** @hidden */
export class PrivilegedStrengthMachines extends ModelList<PrivilegedStrengthMachine, StrengthMachineData, StrengthMachineListResponseMeta> {
  constructor (strengthMachines: StrengthMachineData[], strengthMachinesMeta: StrengthMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStrengthMachine, strengthMachines, strengthMachinesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthMachine extends StrengthMachine {
  constructor (strengthMachineData: StrengthMachineData, sessionHandler: SessionHandler) {
    super(strengthMachineData, sessionHandler)
  }

  async update (params: { name: string, line: StrengthMachineLine, variant?: string, exerciseId?: number }) {
    const { strengthMachine } = await this.action('strengthMachine:update', { ...params, id: this.id }) as StrengthMachineResponse
    this.setStrengthMachineData(strengthMachine)
    return this
  }

  async delete () {
    await this.action('strengthMachine:delete', { id : this.id })
  }

  // To-Do: Add model methods (add/delete)
}
