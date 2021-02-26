import { ForceUnit, Side, TestSide } from '../constants'

export interface A500RepData {
  side: Side
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

export interface A500SetData {
  startedAt: Date
  endedAt: Date
  type: string
  testSide: TestSide
  repData: A500RepData[]
}

export interface A500TimeSeriesDataPoint {
  id: number
  left: A500TimeSeriesDataPointSide
  right: A500TimeSeriesDataPointSide
  timeSinceEpoch: number
}

export interface A500TimeSeriesDataPointSide {
  force: number
  position: number
  power: number
  velocity: number
  acceleration: number
  forceOfMassAcceleration: number
  mechanicalWeight: number
}
