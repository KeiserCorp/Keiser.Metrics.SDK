import { ForceUnit } from '../constants'
import { SubscribableModel, SubscribableModelList, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { A500DataSet, A500DataSetData } from './a500DataSet'
import { Session, SessionData } from './session'
import { StrengthExercise, StrengthExerciseData } from './strengthExercise'
import { StrengthMachine, StrengthMachineData } from './strengthMachine'
import { UserData } from './user'

export enum ResistancePrecision {
  Integer = 'int',
  Decimal = 'dec'
}

export enum StrengthTestType {
  Power6Rep = 'power6r',
  A4206Rep = 'a4206r',
  A42010Rep = 'a42010r',
  A50010Rep = 'a50010r'
}

export enum StrengthMachineDataSetSorting {
  ID = 'id',
  CompletedAt = 'completedAt'
}

export enum StrengthMachineDataSetExportFormat {
  KA5 = 'ka5'
}

export interface StrengthMachineDataSetData {
  id: number
  userId: number
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
  a500DataSet?: A500DataSetData
  session?: SessionData
}

export interface KA5StrengthMachineDataSetData extends StrengthMachineDataSetData {
  user: UserData
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

export interface StrengthMachineDataSetListResponseMeta extends UserListMeta {
  from?: string
  to?: string
  sort: StrengthMachineDataSetSorting
}

export interface StrengthMachineDataSetExportResponse extends AuthenticatedResponse {
  format: StrengthMachineDataSetExportFormat
  encoding: 'b64'
  data: string
}

export class StrengthMachineDataSets extends SubscribableModelList<StrengthMachineDataSet, StrengthMachineDataSetData, StrengthMachineDataSetListResponseMeta> {
  constructor (strengthMachineDataSets: StrengthMachineDataSetData[], strengthMachineDataSetsMeta: StrengthMachineDataSetListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthMachineDataSet, strengthMachineDataSets, strengthMachineDataSetsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'strengthMachineDataSet' }
  }
}

export class StrengthMachineDataSet extends SubscribableModel {
  private _strengthMachineDataSetData: StrengthMachineDataSetData
  private _test?: StrengthMachineDataSetTest

  constructor (strengthMachineDataSetData: StrengthMachineDataSetData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineDataSetData = strengthMachineDataSetData
    this._test = typeof this._strengthMachineDataSetData.test !== 'undefined' ? new StrengthMachineDataSetTest(this._strengthMachineDataSetData.test) : undefined
  }

  private setStrengthMachineDataSet (strengthMachineDataSetData: StrengthMachineDataSetData) {
    this._strengthMachineDataSetData = strengthMachineDataSetData
    this._test = typeof this._strengthMachineDataSetData.test !== 'undefined' ? new StrengthMachineDataSetTest(this._strengthMachineDataSetData.test) : undefined
  }

  protected get subscribeParameters () {
    return { model: 'strengthMachineDataSet', id: this.id, userId: this.userId }
  }

  async reload () {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:show', { id: this.id, userId: this.userId }) as StrengthMachineDataSetResponse
    this.setStrengthMachineDataSet(strengthMachineDataSet)
    return this
  }

  async delete () {
    await this.action('strengthMachineDataSet:delete', { id: this.id, userId: this.userId })
  }

  ejectData () {
    return this.eject(this._strengthMachineDataSetData)
  }

  get id () {
    return this._strengthMachineDataSetData.id
  }

  get userId () {
    return this._strengthMachineDataSetData.userId
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

  eagerA500DataSet () {
    return typeof this._strengthMachineDataSetData.a500DataSet !== 'undefined' ? new A500DataSet(this._strengthMachineDataSetData.a500DataSet) : undefined
  }

  eagerSession () {
    return typeof this._strengthMachineDataSetData.session !== 'undefined' ? new Session(this._strengthMachineDataSetData.session, this.sessionHandler) : undefined
  }

  eagerStrengthMachine () {
    return typeof this._strengthMachineDataSetData.strengthMachine !== 'undefined' ? new StrengthMachine(this._strengthMachineDataSetData.strengthMachine, this.sessionHandler) : undefined
  }

  eagerStrengthExercise () {
    return typeof this._strengthMachineDataSetData.strengthExercise !== 'undefined' ? new StrengthExercise(this._strengthMachineDataSetData.strengthExercise, this.sessionHandler) : undefined
  }

  async getExportBuffer (params: { format: StrengthMachineDataSetExportFormat }) {
    const { encoding, data } = await this.action('strengthMachineDataSet:export', { ...params, id: this.id }) as StrengthMachineDataSetExportResponse
    switch (encoding) {
      case 'b64':
        return Buffer.from(data, 'base64')
    }
  }

  getFlatExportUrl (params: { format: StrengthMachineDataSetExportFormat }) {
    const url = new URL(this.sessionHandler.connection.baseUrl.toString() + `/user/${this._strengthMachineDataSetData.userId.toString()}/strength-machine-data-set/${this.completedAt.toJSON().slice(0, 19)}.${params.format}`)
    url.searchParams.append('authorization', this.sessionHandler.accessToken)
    return url.toString()
  }
}

export class StrengthMachineDataSetTest {
  private readonly _strengthMachineDataSetTestData: StrengthMachineDataSetTestData
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
  private readonly _strengthMachineDataSetTestSubsetData: StrengthMachineDataSetTestSubsetData

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
