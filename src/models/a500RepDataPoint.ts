import { ForceUnit, TestSide } from '../constants'
import { eject } from '../lib/eject'
import { AuthenticatedResponse } from '../session'

export interface BaseA500RepDataPointData {
  id: number
  side: TestSide.Left | TestSide.Right
  count: number
  work: number
  completedAt: string
  reactionTime: number
  peakPower: number
  averagePower: number
  peakVelocity: number
  averageVelocity: number
  rangeOfMotion: number
  setPointForce: number
  forceUnit: ForceUnit
  startSinceEpoch: number
  endSinceEpoch: number
  addedMass: number
  addedForce: number
}

export interface A500RepDataPointRotaryData extends BaseA500RepDataPointData {
  peakTorque: number
  averageTorque: number
}

export interface A500RepDataPointLinearData extends BaseA500RepDataPointData {
  peakForce: number
  averageForce: number
}

export type A500RepDataPointData = A500RepDataPointRotaryData | A500RepDataPointLinearData

export interface A500RepDataPointResponse extends AuthenticatedResponse {
  a500RepDataPoint: A500RepDataPointData
}

export abstract class BaseA500RepDataPoint {
  protected abstract readonly _a500RepDataPointData: A500RepDataPointData

  ejectData () {
    return eject(this._a500RepDataPointData)
  }

  get id () {
    return this._a500RepDataPointData.id
  }

  get side (): TestSide.Left | TestSide.Right {
    return this._a500RepDataPointData.side
  }

  get count () {
    return this._a500RepDataPointData.count
  }

  get work () {
    return this._a500RepDataPointData.work
  }

  get completedAt () {
    return new Date(this._a500RepDataPointData.completedAt)
  }

  get reactionTime () {
    return this._a500RepDataPointData.reactionTime
  }

  get peakPower () {
    return this._a500RepDataPointData.peakPower
  }

  get averagePower () {
    return this._a500RepDataPointData.averagePower
  }

  get peakVelocity () {
    return this._a500RepDataPointData.peakVelocity
  }

  get averageVelocity () {
    return this._a500RepDataPointData.averageVelocity
  }

  get rangeOfMotion () {
    return this._a500RepDataPointData.rangeOfMotion
  }

  get setPointForce () {
    return this._a500RepDataPointData.setPointForce
  }

  get forceUnit () {
    return this._a500RepDataPointData.forceUnit
  }

  get startSinceEpoch () {
    return this._a500RepDataPointData.startSinceEpoch
  }

  get endSinceEpoch () {
    return this._a500RepDataPointData.endSinceEpoch
  }

  get addedMass () {
    return this._a500RepDataPointData.addedMass
  }

  get addedForce () {
    return this._a500RepDataPointData.addedForce
  }
}

export class A500RepRotaryDataPoint extends BaseA500RepDataPoint {
  protected readonly _a500RepDataPointData: A500RepDataPointRotaryData

  constructor (A500RepDataPointData: A500RepDataPointRotaryData) {
    super()
    this._a500RepDataPointData = A500RepDataPointData
  }

  get peakTorque () {
    return this._a500RepDataPointData.peakTorque
  }

  get averageTorque () {
    return this._a500RepDataPointData.averageTorque
  }
}

export class A500RepLinearDataPoint extends BaseA500RepDataPoint {
  protected readonly _a500RepDataPointData: A500RepDataPointLinearData

  constructor (A500RepDataPointData: A500RepDataPointLinearData) {
    super()
    this._a500RepDataPointData = A500RepDataPointData
  }

  get peakForce () {
    return this._a500RepDataPointData.peakForce
  }

  get averageForce () {
    return this._a500RepDataPointData.averageForce
  }
}

export type A500RepDataPoint = A500RepRotaryDataPoint | A500RepLinearDataPoint
