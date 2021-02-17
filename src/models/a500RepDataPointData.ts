import { Model } from '../model'
import { SessionHandler } from '../session'
import { ForceUnit } from './strengthMachineDataSet'
export const enum a500TestSides {
  Both = 'both',
  Left = 'left',
  Right = 'right',
}

export interface a500RepDataPointData {
  id: number
  side: a500TestSides.Left | a500TestSides.Right
  count: number
  work: number
  completedAt: Date
  reactionTime: number
  peakPower: number
  averagePower: number
  peakVelocity: number
  averageVelocity: number
  peakForce: number
  averageForce: number
  rangeOfMotion: number
  setPointForce: number
  forceUnit: ForceUnit
  startSinceEpoch: number
  endSinceEpoch: number
  addedMass: number
  addedForce: number
}

export class a500RepDataPoint extends Model {
  private readonly _a500RepDataPointData: a500RepDataPointData
  constructor (
    a500RepDataPointData: a500RepDataPointData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler)
    this._a500RepDataPointData = a500RepDataPointData
  }

  public get id (): number {
    return this._a500RepDataPointData.id
  }

  public get side (): a500TestSides.Left | a500TestSides.Right {
    return this._a500RepDataPointData.side
  }

  public get count (): number {
    return this._a500RepDataPointData.count
  }

  public get work (): number {
    return this._a500RepDataPointData.work
  }

  public get completedAt (): Date {
    return new Date(this._a500RepDataPointData.completedAt)
  }

  public get reactionTime (): number {
    return this._a500RepDataPointData.reactionTime
  }

  public get peakPower (): number {
    return this._a500RepDataPointData.peakPower
  }

  public get averagePower (): number {
    return this._a500RepDataPointData.averagePower
  }

  public get peakVelocity (): number {
    return this._a500RepDataPointData.peakVelocity
  }

  public get averageVelocity (): number {
    return this._a500RepDataPointData.averageVelocity
  }

  public get peakForce (): number {
    return this._a500RepDataPointData.peakForce
  }

  public get averageForce (): number {
    return this._a500RepDataPointData.averageForce
  }

  public get rangeOfMotion (): number {
    return this._a500RepDataPointData.rangeOfMotion
  }

  public get setPointForce (): number {
    return this._a500RepDataPointData.setPointForce
  }

  public get forceUnit (): ForceUnit {
    return this._a500RepDataPointData.forceUnit
  }

  public get startSinceEpoch (): number {
    return this._a500RepDataPointData.startSinceEpoch
  }

  public get endSinceEpoch (): number {
    return this._a500RepDataPointData.endSinceEpoch
  }

  public get addedMass (): number {
    return this._a500RepDataPointData.addedMass
  }

  public get addedForce (): number {
    return this._a500RepDataPointData.addedForce
  }
}
