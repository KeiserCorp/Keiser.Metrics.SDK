import { ForceUnit } from './strengthMachineDataSet'

export enum A500Side {
  Left = 'left',
  Right = 'right',
  Both = 'both'
}

export interface A500RepData {
  side: A500Side
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

export interface A500DataSet {
  startedAt: Date
  endedAt: Date
  type: string
  testSide: A500Side
  sampleData: any[]
  repData: A500RepData[]
}
