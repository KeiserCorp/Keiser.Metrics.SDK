import { ForceUnit } from './strengthMachineDataSet'
export interface a500DataSetData {
  Id: number
  createdAt: string
  updatedAt: string
  displaySoftwareVersion: string
  epochAt: Date
  type: a500SetType
  testSide: a500TestSides
  graphData?: a500RepDataPointData[]
  leftTestResultId: number
  rightTestResultId: number
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

export interface a500TestResultData{
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

export interface a500TimeSeriesPointData {
  id: number
  timeSinceEpoch: number
  leftPosition: number
  leftPower: number
  leftForce: number
  leftVelocity: number
  leftAcceleration: number
  leftForceOfMassAcceleration: number
  leftMechanicalWeight: number
  rightPosition: number
  rightPower: number
  rightForce: number
  rightVelocity: number
  rightAcceleration: number
  rightForceOfMassAcceleration: number
  rightMechanicalWeight: number
}
export const enum a500SetType{
  Normal = 'Normal',
  Test = 'test'
}
export const enum a500TestSides {
  Both = 'both',
  Left = 'left',
  Right = 'right'
}
