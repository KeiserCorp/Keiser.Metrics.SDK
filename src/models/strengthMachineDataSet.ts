import { DeepReadonly } from '../lib/readonly'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Session, SessionData } from './session'

export enum ResistancePrecision {
  Integer = 'int',
  Decimal = 'dec'
}

export enum ForceUnit {
  Pounds = 'lb',
  Kilograms = 'kg',
  Newtons = 'ne',
  Unknown = 'er'
}

export enum StrengthTestType {
  Power6Rep = 'power6r',
  A4206Rep = 'a4206r',
  A42010Rep = 'a42010r',
  A50010Rep = 'a50010r'
}

export interface StrengthMachineDataSetData {
  id: number
  updatedAt: string
  version: string
  serial: string
  completedAt: string
  chest: number
  rom1: number
  rom2: number
  seat: number
  resistance: number
  resistancePrecision: ResistancePrecision
  repetitionCount: number
  forceUnit: ForceUnit
  peakPower: number
  work: number
  distance: number | null
  addedWeight: number | null
  test?: StrengthMachineDataSetTestData

  strengthMachine?: any    // To-Do: Add Strength Machine model
  exercise?: any           // To-Do: Add Exercise model
  a500DataSet?: any        // To-Do: Add A500 Data Set model

  session?: SessionData
}

export interface StrengthMachineDataSetTestData {
  testType: StrengthTestType
  high: {
    power: number
    velocity: number
    force: number
    position: number
  }
  low: {
    power: number
    velocity: number
    force: number
    position: number
  }
}

export interface StrengthMachineDataSetResponse extends AuthenticatedResponse {
  strengthMachineDataSet: StrengthMachineDataSetData
}

export interface StrengthMachineDataSetListResponse extends AuthenticatedResponse {
  strengthMachineDataSets: StrengthMachineDataSetData[]
}

export class StrengthMachineDataSet extends Model {
  private _strengthMachineDataSetData: StrengthMachineDataSetData
  private _userId: number

  constructor (strengthMachineDataSetData: StrengthMachineDataSetData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineDataSetData = strengthMachineDataSetData
    this._userId = userId
  }

  private setStrengthMachineDataSet (strengthMachineDataSetData: StrengthMachineDataSetData) {
    this._strengthMachineDataSetData = strengthMachineDataSetData
  }

  async reload () {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:show', { userId: this._userId, id: this.id }) as StrengthMachineDataSetResponse
    this.setStrengthMachineDataSet(strengthMachineDataSet)
    return this
  }

  // To-Do: Decide if `update` method is necessary

  async delete () {
    await this.action('strengthMachineDataSet:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._strengthMachineDataSetData.id
  }

  get updatedAt () {
    return new Date(this._strengthMachineDataSetData.updatedAt)
  }

  get version () {
    return this._strengthMachineDataSetData.version
  }

  get serial () {
    return this._strengthMachineDataSetData.serial
  }

  get completedAt () {
    return new Date(this._strengthMachineDataSetData.completedAt)
  }

  get chest () {
    return this._strengthMachineDataSetData.chest
  }

  get rom1 () {
    return this._strengthMachineDataSetData.rom1
  }

  get rom2 () {
    return this._strengthMachineDataSetData.rom2
  }

  get seat () {
    return this._strengthMachineDataSetData.seat
  }

  get resistance () {
    return this._strengthMachineDataSetData.resistance
  }

  get resistancePrecision () {
    return this._strengthMachineDataSetData.resistancePrecision
  }

  get repetitionCount () {
    return this._strengthMachineDataSetData.repetitionCount
  }

  get forceUnit () {
    return this._strengthMachineDataSetData.forceUnit
  }

  get peakPower () {
    return this._strengthMachineDataSetData.peakPower
  }

  get work () {
    return this._strengthMachineDataSetData.work
  }

  get distance () {
    return this._strengthMachineDataSetData.distance
  }

  get addedWeight () {
    return this._strengthMachineDataSetData.addedWeight
  }

  get test () {
    return this._strengthMachineDataSetData.test ? { ...this._strengthMachineDataSetData.test } as DeepReadonly<StrengthMachineDataSetTestData> : undefined
  }

  get Session () {
    return this._strengthMachineDataSetData.session ? new Session(this._strengthMachineDataSetData.session, this._userId, this.sessionHandler) : undefined
  }
}