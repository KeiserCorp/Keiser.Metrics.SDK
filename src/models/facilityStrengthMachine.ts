import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { StrengthMachine, StrengthMachineData } from './strengthMachine'

export const enum FacilityStrengthMachineSorting {
  ID = 'id',
  Model = 'model'
}

export interface FacilityStrengthMachineData {
  id: number
  model: string
  version: string
  serial: string
  location: string | null
  strengthMachine?: StrengthMachineData
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

export interface FacilityStrengthMachineListResponseMeta extends ListMeta {
  model: string
  source: string
  sort: FacilityStrengthMachineSorting
}

export class FacilityStrengthMachines extends ModelList<FacilityStrengthMachine, FacilityStrengthMachineData, FacilityStrengthMachineListResponseMeta> {
  constructor (facilityStrengthMachines: FacilityStrengthMachineData[], facilityStrengthMachinesMeta: FacilityStrengthMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityStrengthMachine, facilityStrengthMachines, facilityStrengthMachinesMeta, sessionHandler)
  }
}

export class FacilityStrengthMachine extends Model {
  private _facilityStrengthMachineData: FacilityStrengthMachineData

  constructor (facilityStrengthMachineData: FacilityStrengthMachineData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityStrengthMachineData = facilityStrengthMachineData
  }

  private setFacilityStrengthMachineData (facilityStrengthMachineData: FacilityStrengthMachineData) {
    this._facilityStrengthMachineData = facilityStrengthMachineData
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

  get id () {
    return this._facilityStrengthMachineData.id
  }

  get model () {
    return this._facilityStrengthMachineData.model
  }

  get version () {
    return this._facilityStrengthMachineData.version
  }

  get location () {
    return this._facilityStrengthMachineData.location
  }

  eagerStrengthMachine () {
    return typeof this._facilityStrengthMachineData.strengthMachine !== 'undefined' ? new StrengthMachine(this._facilityStrengthMachineData.strengthMachine, this.sessionHandler) : undefined
  }
}
