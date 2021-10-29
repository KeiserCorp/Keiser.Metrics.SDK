import { ForceUnit } from '../constants'
import { SubscribableModel } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { StrengthMachineFocusableAttribute } from './strengthMachine'

export interface A500MachineStateData {
  facilityStrengthMachineId: number
  forceUnit: ForceUnit
  primaryFocus: StrengthMachineFocusableAttribute
  secondaryFocus: StrengthMachineFocusableAttribute
}

export interface A500MachineStateResponse extends AuthenticatedResponse {
  a500MachineState: A500MachineStateData
}

export class A500MachineState extends SubscribableModel {
  private _a500MachineState: A500MachineStateData

  constructor (a500MachineStateData: A500MachineStateData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._a500MachineState = a500MachineStateData
  }

  private setA500MachineState (a500MachineStateData: A500MachineStateData) {
    this._a500MachineState = a500MachineStateData
  }

  protected get subscribeParameters () {
    return { model: 'a500MachineState', id: this._a500MachineState.facilityStrengthMachineId, actionOverride: 'a500:subscribeMachineState' }
  }

  async reload () {
    const { a500MachineState } = await this.action('a500:showMachineState') as A500MachineStateResponse
    this.setA500MachineState(a500MachineState)
    return this
  }

  async update (params: { forceUnit: ForceUnit, primaryFocus: string, secondaryFocus: string }) {
    const { a500MachineState } = await this.action('a500:updateMachineState', params) as A500MachineStateResponse
    this.setA500MachineState(a500MachineState)
    return this
  }

  ejectData () {
    return this.eject(this._a500MachineState)
  }

  get forceUnit () {
    return this._a500MachineState.forceUnit
  }

  get primaryFocus () {
    return this._a500MachineState.primaryFocus
  }

  get secondaryFocus () {
    return this._a500MachineState.secondaryFocus
  }
}
