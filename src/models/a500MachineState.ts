import { ForceUnit } from '../constants'
import { Model } from '../model'
import { AuthenticatedResponse, StrengthMachineSessionHandler } from '../session'

export interface A500MachineStateData {
  forceUnits: ForceUnit
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

  async update (params: { forceUnits: ForceUnit, primaryFocus: string, secondaryFocus: string }) {
    const { a500MachineState } = await this.action('a500:updateMachineState', params) as A500MachineStateResponse
    this.setA500MachineState(a500MachineState)
    return this
  }

  get forceUnits () {
    return this._a500MachineState.forceUnits
  }

  get primaryFocus () {
    return this._a500MachineState.primaryFocus
  }

  get secondaryFocus () {
    return this._a500MachineState.secondaryFocus
  }
}

export class StaticA500MachineState {
  private readonly _a500MachineState: A500MachineStateData

  constructor (a500MachineStateData: A500MachineStateData) {
    this._a500MachineState = a500MachineStateData
  }

  get forceUnits () {
    return this._a500MachineState.forceUnits
  }

  get primaryFocus () {
    return this._a500MachineState.primaryFocus
  }

  get secondaryFocus () {
    return this._a500MachineState.secondaryFocus
  }

  public toJSON () {
    return this._a500MachineState
  }
}
