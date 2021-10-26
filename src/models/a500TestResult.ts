import { eject } from '../lib/eject'
import { AuthenticatedResponse } from '../session'
export interface A500TestResultData {
  id: number
  averageVelocityLineM: number
  averageVelocityLineB: number
  averagePowerParabolaA: number
  averagePowerParabolaH: number
  averagePowerParabolaK: number
  averageSlopeChanges: number
  peakVelocityLineM: number
  peakVelocityLineB: number
  peakPowerParabolaA: number
  peakPowerParabolaH: number
  peakPowerParabolaK: number
  peakSlopeChanges: number
}

export interface A500TestResultResponse extends AuthenticatedResponse {
  A500TestResult: A500TestResultData
}

export class A500TestResult {
  private readonly _a500TestResultData: A500TestResultData

  constructor (a500TestResultData: A500TestResultData) {
    this._a500TestResultData = a500TestResultData
  }

  ejectData () {
    return eject(this._a500TestResultData)
  }

  get id () {
    return this._a500TestResultData.id
  }

  get averageVelocityLineM () {
    return this._a500TestResultData.averageVelocityLineM
  }

  get averageVelocityLineB () {
    return this._a500TestResultData.averageVelocityLineB
  }

  get averagePowerParabolaA () {
    return this._a500TestResultData.averagePowerParabolaA
  }

  get averagePowerParabolaH () {
    return this._a500TestResultData.averagePowerParabolaH
  }

  get averagePowerParabolaK () {
    return this._a500TestResultData.averagePowerParabolaK
  }

  get averageSlopeChanges () {
    return this._a500TestResultData.averageSlopeChanges
  }

  get peakVelocityLineM () {
    return this._a500TestResultData.peakVelocityLineM
  }

  get peakVelocityLineB () {
    return this._a500TestResultData.peakVelocityLineB
  }

  get peakPowerParabolaA () {
    return this._a500TestResultData.peakPowerParabolaA
  }

  get peakPowerParabolaH () {
    return this._a500TestResultData.peakPowerParabolaH
  }

  get peakPowerParabolaK () {
    return this._a500TestResultData.peakPowerParabolaK
  }

  get peakSlopeChanges () {
    return this._a500TestResultData.peakSlopeChanges
  }
}
