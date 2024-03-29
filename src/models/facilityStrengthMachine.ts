import { getAvailableMachineAdjustments, MachineModelType } from '../lib/machineAdjustments'
import { FacilityListMeta, SubscribableModel, SubscribableModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { A500MachineState, A500MachineStateData } from './a500MachineState'
import { StrengthMachine, StrengthMachineData } from './strengthMachine'

export enum FacilityStrengthMachineSorting {
  ID = 'id',
  Model = 'model'
}

export interface FacilityStrengthMachineData {
  id: number
  updatedAt: string
  model: string
  version: string
  softwareVersion: string | null
  mainBoardSerial: string | null
  location: string | null
  displayUUID: string | null
  leftCylinderSerial: string | null
  rightCylinderSerial: string | null
  strengthMachine?: StrengthMachineData
  a500MachineState?: A500MachineStateData
}

export interface FacilityStrengthMachineInitializerTokenResponse extends AuthenticatedResponse {
  initializerToken: string
  url: string
  isEncrypted: boolean
}

export interface FacilityStrengthMachineInitializerOTPTokenResponse extends FacilityStrengthMachineInitializerTokenResponse {
  expiresAt: string
}

export interface FacilityStrengthMachineResponse extends AuthenticatedResponse {
  facilityStrengthMachine: FacilityStrengthMachineData
}

export interface FacilityStrengthMachineListResponse extends AuthenticatedResponse {
  facilityStrengthMachines: FacilityStrengthMachineData[]
  facilityStrengthMachinesMeta: FacilityStrengthMachineListResponseMeta
}

export interface FacilityStrengthMachineBulkCreateResponse extends AuthenticatedResponse {
  facilityStrengthMachines: FacilityStrengthMachineData[]
  unknownMachines: FacilityStrengthMachineData[]
}

export interface FacilityStrengthMachineListResponseMeta extends FacilityListMeta {
  model: string
  source: string
  sort: FacilityStrengthMachineSorting
}

export class FacilityStrengthMachines extends SubscribableModelList<FacilityStrengthMachine, FacilityStrengthMachineData, FacilityStrengthMachineListResponseMeta> {
  constructor (facilityStrengthMachines: FacilityStrengthMachineData[], facilityStrengthMachinesMeta: FacilityStrengthMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityStrengthMachine, facilityStrengthMachines, facilityStrengthMachinesMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'facilityStrengthMachine' }
  }
}

export class FacilityStrengthMachine extends SubscribableModel {
  private _facilityStrengthMachineData: FacilityStrengthMachineData

  constructor (facilityStrengthMachineData: FacilityStrengthMachineData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityStrengthMachineData = facilityStrengthMachineData
  }

  private setFacilityStrengthMachineData (facilityStrengthMachineData: FacilityStrengthMachineData) {
    this._facilityStrengthMachineData = facilityStrengthMachineData
  }

  protected get subscribeParameters () {
    return { model: 'facilityStrengthMachine', id: this.id }
  }

  async getAvailableAdjustments (model: MachineModelType) {
    return getAvailableMachineAdjustments(model)
  }

  async reload () {
    const { facilityStrengthMachine } = await this.action('facilityStrengthMachine:show', { id: this.id }) as FacilityStrengthMachineResponse
    this.setFacilityStrengthMachineData(facilityStrengthMachine)
    return this
  }

  async update (params: { location?: string | null }) {
    const { facilityStrengthMachine } = await this.action('facilityStrengthMachine:update', { ...params, id: this.id }) as FacilityStrengthMachineResponse
    this.setFacilityStrengthMachineData(facilityStrengthMachine)
    return this
  }

  async delete () {
    await this.action('facilityStrengthMachine:delete', { id: this.id })
  }

  ejectData () {
    return this.eject(this._facilityStrengthMachineData)
  }

  get id () {
    return this._facilityStrengthMachineData.id
  }

  get updatedAt () {
    return new Date(this._facilityStrengthMachineData.updatedAt)
  }

  get model () {
    return this._facilityStrengthMachineData.model
  }

  get version () {
    return this._facilityStrengthMachineData.version
  }

  get softwareVersion () {
    return this._facilityStrengthMachineData.softwareVersion
  }

  /**
   * @deprecated
   */
  get serial () {
    return this._facilityStrengthMachineData.mainBoardSerial
  }

  get displayUUID () {
    return this._facilityStrengthMachineData.displayUUID
  }

  get mainBoardSerial () {
    return this._facilityStrengthMachineData.mainBoardSerial
  }

  get leftCylinderSerial () {
    return this._facilityStrengthMachineData.leftCylinderSerial
  }

  get rightCylinderSerial () {
    return this._facilityStrengthMachineData.rightCylinderSerial
  }

  get location () {
    return this._facilityStrengthMachineData.location
  }

  eagerStrengthMachine () {
    return typeof this._facilityStrengthMachineData.strengthMachine !== 'undefined' ? new StrengthMachine(this._facilityStrengthMachineData.strengthMachine, this.sessionHandler) : undefined
  }

  eagerA500MachineState () {
    return typeof this._facilityStrengthMachineData.a500MachineState !== 'undefined' ? new A500MachineState(this._facilityStrengthMachineData.a500MachineState, this.sessionHandler) : undefined
  }
}
