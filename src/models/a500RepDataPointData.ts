import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ForceUnit } from './strengthMachineDataSet'
export const enum A500TestSides {
  Both = 'both',
  Left = 'left',
  Right = 'right',
}

export interface A500RepDataPointData {
  id: number
  side: A500TestSides.Left | A500TestSides.Right
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

export interface A500RepDataPointResponse extends AuthenticatedResponse {
  a400RepDataPoint: A500RepDataPointData
}

export class A500RepDataPoint extends Model {
  private readonly _a500RepDataPointData: A500RepDataPointData
  constructor (
    A500RepDataPointData: A500RepDataPointData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler)
    this._a500RepDataPointData = A500RepDataPointData
  }

  public get id (): number {
    return this._a500RepDataPointData.id
  }

  public get side (): A500TestSides.Left | A500TestSides.Right {
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
