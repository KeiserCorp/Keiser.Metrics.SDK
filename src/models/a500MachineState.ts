import { ForceUnit } from '../constants'
import { Model } from '../model'
import { AuthenticatedResponse, StrengthMachineSessionHandler } from '../session'

export interface A500MachineStateData {
  forceUnit: ForceUnit
  primaryFocus: string
  secondaryFocus: string
}

export interface A500MachineStateResponse extends AuthenticatedResponse {
  a500MachineState: A500MachineStateData
}

export class A500MachineState extends Model<StrengthMachineSessionHandler> {
  private _a500MachineState: A500MachineStateData

  constructor (a500MachineStateData: A500MachineStateData, sessionHandler: StrengthMachineSessionHandler) {
    super(sessionHandler)
    this._a500MachineState = a500MachineStateData
  }

  private setA500MachineState (a500MachineStateData: A500MachineStateData) {
    this._a500MachineState = a500MachineStateData
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
    return { ...this._a500MachineState }
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
