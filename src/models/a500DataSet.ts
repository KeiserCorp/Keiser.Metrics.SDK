import { ForceUnit, Side, TestSide } from '../constants'
import { eject } from '../lib/eject'
import { A500RepDataPointData, A500RepLinearDataPoint, A500RepRotaryDataPoint } from './a500RepDataPoint'
import { A500TestResult, A500TestResultData } from './a500TestResult'
import { A500TimeSeriesPoint, A500TimeSeriesPointData } from './a500TimeSeriesPoint'

export enum A500DataSetType {
  Normal = 'normal',
  Test = 'test'
}

export interface BaseA500RepData {
  side: Side
  count: number
  work: number
  completedAt: Date
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

export interface A500RepRotaryData extends BaseA500RepData {
  peakTorque: number
  averageTorque: number
}

export interface A500RepLinearData extends BaseA500RepData {
  peakForce: number
  averageForce: number
}

export type A500RepData = A500RepRotaryData | A500RepLinearData

export interface A500SetData {
  startedAt: Date
  endedAt: Date
  type: string
  testSide: TestSide | null
  repData: A500RepData[]
}

export interface A500DataSetData {
  id: number
  displaySoftwareVersion: string
  epochAt: string
  type: A500DataSetType
  testSide: TestSide | null
  leftTestResult?: A500TestResultData
  rightTestResult?: A500TestResultData
  a500RepDataPoints?: A500RepDataPointData[]
  a500TimeSeriesPoints?: A500TimeSeriesPointData[]
}

export class A500DataSet {
  private readonly _a500DataSetData: A500DataSetData

  constructor (a500DataSetData: A500DataSetData) {
    this._a500DataSetData = a500DataSetData
  }

  ejectData () {
    return eject(this._a500DataSetData)
  }

  get id () {
    return this._a500DataSetData.id
  }

  get displaySoftwareVersion () {
    return this._a500DataSetData.displaySoftwareVersion
  }

  get epochAt () {
    return new Date(this._a500DataSetData.epochAt)
  }

  get type () {
    return this._a500DataSetData.type
  }

  get testSide () {
    return this._a500DataSetData.testSide
  }

  eagerLeftTestResult () {
    return typeof this._a500DataSetData.leftTestResult !== 'undefined' ? new A500TestResult(this._a500DataSetData.leftTestResult) : undefined
  }

  eagerRightTestResult () {
    return typeof this._a500DataSetData.rightTestResult !== 'undefined' ? new A500TestResult(this._a500DataSetData.rightTestResult) : undefined
  }

  eagerRepDataPoints () {
    return typeof this._a500DataSetData.a500RepDataPoints !== 'undefined' ? this._a500DataSetData.a500RepDataPoints.map(a500RepDataPoint => 'peakTorque' in a500RepDataPoint ? new A500RepRotaryDataPoint(a500RepDataPoint) : new A500RepLinearDataPoint(a500RepDataPoint)) : undefined
  }

  eagerTimeSeriesPoints () {
    return typeof this._a500DataSetData.a500TimeSeriesPoints !== 'undefined' ? this._a500DataSetData.a500TimeSeriesPoints.map(a500TimeSeriesPoint => new A500TimeSeriesPoint(a500TimeSeriesPoint)) : undefined
  }
}
