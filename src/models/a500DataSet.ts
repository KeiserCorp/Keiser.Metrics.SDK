import { A500Type, ForceUnit, Side, TestSide } from '../constants'
import { A500RepDataPointData, A500RepDataPoints } from './a500RepDataPointData'
import { A500TestResult, A500TestResultData } from './a500TestResultData'
import { A500TimeSeriesPointData, A500TimeSeriesPoints } from './a500TimeSeriesPointData'

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

export interface A500DataSetData {
  id: number
  displaySoftwareVersion: string
  epochAt: string
  type: A500Type
  testSide?: TestSide
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
    return typeof this._a500DataSetData.a500RepDataPoints !== 'undefined' ? new A500RepDataPoints(this._a500DataSetData.a500RepDataPoints) : undefined
  }

  eagerTimeSeriesPoints () {
    return typeof this._a500DataSetData.a500TimeSeriesPoints !== 'undefined' ? new A500TimeSeriesPoints(this._a500DataSetData.a500TimeSeriesPoints) : undefined
  }
}
