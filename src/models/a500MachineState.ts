import { MachineModel } from '../model'
import { AuthenticatedResponse, MachineSessionHandler } from '../session'
import { ForceUnit } from './strengthMachineDataSet'

export interface A500MachineStateData {
  forceUnits: ForceUnit
  primaryFocus: string
  secondaryFocus: string
}

export interface A500MachineStateResponse extends AuthenticatedResponse {
  a500MachineState: A500MachineStateData
}

export class A500MachineState extends MachineModel {
  private _a500MachineState: A500MachineStateData

  constructor (a500MachineStateData: A500MachineStateData, machineSessionHandler: MachineSessionHandler) {
    super(machineSessionHandler)
    this._a500MachineState = a500MachineStateData
  }

  private setA500MachineState (a500MachineStateData: A500MachineStateData) {
    this._a500MachineState = a500MachineStateData
  }

  protected async action (action: string, params: Object = { }) {
    return await this.sessionHandler.action(action, params)
  }

  async reload () {
    const { a500MachineState } = await this.action('a500FacilityStrengthMachineState:show') as A500MachineStateResponse
    this.setA500MachineState(a500MachineState)
    return this
  }

  async update (params: {
    forceUnits: ForceUnit
    primaryFocus: string
    secondaryFocus: string
  }) {
    const { a500MachineState } = await this.action('a500FacilityStrengthMachineState:update', params) as A500MachineStateResponse
    this.setA500MachineState(a500MachineState)
    return this
  }

  get focusUnits () {
    return this._a500MachineState.forceUnits
  }

  get primaryFocus () {
    return this._a500MachineState.primaryFocus
  }

  get secondaryFocus () {
    return this._a500MachineState.secondaryFocus
  }
}
