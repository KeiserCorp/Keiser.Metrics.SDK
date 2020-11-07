import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Session, SessionData } from './session'
import { StrengthExercise, StrengthExerciseData } from './strengthExercise'
import { StrengthMachine, StrengthMachineData } from './strengthMachine'

export const enum ResistancePrecision {
  Integer = 'int',
  Decimal = 'dec'
}

export const enum ForceUnit {
  Pounds = 'lb',
  Kilograms = 'kg',
  Newtons = 'ne',
  Unknown = 'er'
}

export const enum StrengthTestType {
  Power6Rep = 'power6r',
  A4206Rep = 'a4206r',
  A42010Rep = 'a42010r',
  A50010Rep = 'a50010r'
}

export const enum StrengthMachineDataSetSorting {
  ID = 'id',
  CompletedAt = 'completedAt'
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
  strengthMachine?: StrengthMachineData
  strengthExercise?: StrengthExerciseData
  a500DataSet?: any        // To-Do: Add A500 Data Set model

  session?: SessionData
}

export interface StrengthMachineDataSetTestData {
  testType: StrengthTestType
  high: StrengthMachineDataSetTestSubsetData
  low: StrengthMachineDataSetTestSubsetData
}

export interface StrengthMachineDataSetTestSubsetData {
  power: number
  velocity: number
  force: number
  position: number
}

export interface StrengthMachineDataSetResponse extends AuthenticatedResponse {
  strengthMachineDataSet: StrengthMachineDataSetData
}

export interface StrengthMachineDataSetListResponse extends AuthenticatedResponse {
  strengthMachineDataSets: StrengthMachineDataSetData[]
  strengthMachineDataSetsMeta: StrengthMachineDataSetListResponseMeta
}

export interface StrengthMachineDataSetListResponseMeta extends ListMeta {
  from: string | undefined
  to: string | undefined
  sort: StrengthMachineDataSetSorting
}

export class StrengthMachineDataSets extends ModelList<StrengthMachineDataSet, StrengthMachineDataSetData, StrengthMachineDataSetListResponseMeta> {
  constructor (strengthMachineDataSets: StrengthMachineDataSetData[], strengthMachineDataSetsMeta: StrengthMachineDataSetListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthMachineDataSet, strengthMachineDataSets, strengthMachineDataSetsMeta, sessionHandler)
  }
}

export class StrengthMachineDataSet extends Model {
  private _strengthMachineDataSetData: StrengthMachineDataSetData
  private _test?: StrengthMachineDataSetTest

  constructor (strengthMachineDataSetData: StrengthMachineDataSetData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineDataSetData = strengthMachineDataSetData
    this._test = this._strengthMachineDataSetData.test ? new StrengthMachineDataSetTest(this._strengthMachineDataSetData.test) : undefined
  }

  private setStrengthMachineDataSet (strengthMachineDataSetData: StrengthMachineDataSetData) {
    this._strengthMachineDataSetData = strengthMachineDataSetData
    this._test = this._strengthMachineDataSetData.test ? new StrengthMachineDataSetTest(this._strengthMachineDataSetData.test) : undefined
  }

  async reload () {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:show', { id: this.id }) as StrengthMachineDataSetResponse
    this.setStrengthMachineDataSet(strengthMachineDataSet)
    return this
  }

  async delete () {
    await this.action('strengthMachineDataSet:delete', { id: this.id })
  }

  get id () {
    return this._strengthMachineDataSetData.id
  }

  get updatedAt () {
    return new Date(this._strengthMachineDataSetData.updatedAt)
  }

  /**
   * @returns Machine's firmware version string
   */
  get version () {
    return this._strengthMachineDataSetData.version
  }

  /**
   * @returns Machine's serial number string (for electronics only)
   */
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

  /**
   * @returns Dimensionless number for resistance (unit based on forceUnit property)
   */
  get resistance () {
    return this._strengthMachineDataSetData.resistance
  }

  /**
   * @returns Precision of resistance measurement (decimal or integer)
   */
  get resistancePrecision () {
    return this._strengthMachineDataSetData.resistancePrecision
  }

  /**
   * @returns Number of repetitions performed
   */
  get repetitionCount () {
    return this._strengthMachineDataSetData.repetitionCount
  }

  /**
   * @returns Unit to assign to resistance property
   */
  get forceUnit () {
    return this._strengthMachineDataSetData.forceUnit
  }

  /**
   * @returns Peak power in Watts
   */
  get peakPower () {
    return this._strengthMachineDataSetData.peakPower
  }

  /**
   * @returns Work for entire set in Joules
   */
  get work () {
    return this._strengthMachineDataSetData.work
  }

  /**
   * @returns Number of complete step cycles (for Runner only)
   */
  get distance () {
    return this._strengthMachineDataSetData.distance
  }

  /**
   * @returns Dimensionless number for additional mass added to rack bar (assumed to be in same unit as resistance)
   */
  get addedWeight () {
    return this._strengthMachineDataSetData.addedWeight
  }

  get test () {
    return this._test
  }

  eagerSession () {
    return this._strengthMachineDataSetData.session ? new Session(this._strengthMachineDataSetData.session, this.sessionHandler) : undefined
  }

  eagerStrengthMachine () {
    return this._strengthMachineDataSetData.strengthMachine ? new StrengthMachine(this._strengthMachineDataSetData.strengthMachine, this.sessionHandler) : undefined
  }

  eagerStrengthExercise () {
    return this._strengthMachineDataSetData.strengthExercise ? new StrengthExercise(this._strengthMachineDataSetData.strengthExercise, this.sessionHandler) : undefined
  }
}

export class StrengthMachineDataSetTest {
  private _strengthMachineDataSetTestData: StrengthMachineDataSetTestData
  private readonly _low: StrengthMachineDataSetTestSubset
  private readonly _high: StrengthMachineDataSetTestSubset

  constructor (strengthMachineDataSetTestData: StrengthMachineDataSetTestData) {
    this._strengthMachineDataSetTestData = strengthMachineDataSetTestData
    this._low = new StrengthMachineDataSetTestSubset(this._strengthMachineDataSetTestData.low)
    this._high = new StrengthMachineDataSetTestSubset(this._strengthMachineDataSetTestData.high)
  }

  get testType () {
    return this._strengthMachineDataSetTestData.testType
  }

  /**
   * @returns Values relative to the rep with the highest power generated in the low resistance set
   */
  get low () {
    return this._low
  }

  /**
   * @returns Values relative to the rep with the highest power generated in the high resistance set
   */
  get high () {
    return this._high
  }
}

export class StrengthMachineDataSetTestSubset {
  private _strengthMachineDataSetTestSubsetData: StrengthMachineDataSetTestSubsetData

  constructor (strengthMachineDataSetTestSubsetData: StrengthMachineDataSetTestSubsetData) {
    this._strengthMachineDataSetTestSubsetData = strengthMachineDataSetTestSubsetData
  }

  /**
   * @returns Power in Watts
   */
  get power () {
    return this._strengthMachineDataSetTestSubsetData.power
  }

  /**
   * @returns Velocity at cylinder in meters per second (untranslated)
   */
  get velocity () {
    return this._strengthMachineDataSetTestSubsetData.velocity
  }

  /**
   * @returns Dimensionless resistance (unit based on forceUnit property)
   */
  get force () {
    return this._strengthMachineDataSetTestSubsetData.force
  }

  /**
   * @returns Point in the range of motion relative to the cylinder in meters (untranslated)
   */
  get position () {
    return this._strengthMachineDataSetTestSubsetData.position
  }
}
