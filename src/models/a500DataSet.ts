import { Model } from '../model'
import { SessionHandler } from '../session'
import { a500RepDataPointData, a500TestSides } from './a500RepDataPointData'
export const enum a500SetType {
  Normal = 'Normal',
  Test = 'test',
}
export interface a500DataSetData {
  id: number
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

export class a500DataSet extends Model {
  private readonly _a500DataSetData: a500DataSetData
  constructor (
    a500DataSetData: a500DataSetData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler)
    this._a500DataSetData = a500DataSetData
  }

  public get id (): number {
    return this._a500DataSetData.id
  }

  public get createdAt (): string {
    return this._a500DataSetData.createdAt
  }

  public get updatedAt (): string {
    return this._a500DataSetData.updatedAt
  }

  public get displaySoftwareVersion (): string {
    return this._a500DataSetData.displaySoftwareVersion
  }

  public get epochAt (): Date {
    return this._a500DataSetData.epochAt
  }

  public get type (): a500SetType {
    return this._a500DataSetData.type
  }

  public get testSide (): a500TestSides {
    return this._a500DataSetData.testSide
  }

  public get graphData (): a500RepDataPointData[] | undefined {
    return this._a500DataSetData.graphData
  }

  public get leftTestResultId (): number {
    return this._a500DataSetData.leftTestResultId
  }

  public get rightTestResultId (): number {
    return this._a500DataSetData.rightTestResultId
  }
}
