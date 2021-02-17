import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { A500RepDataPointData, A500TestSides } from './A500RepDataPointData'
export const enum A500SetType {
  Normal = 'normal',
  Test = 'test',
}
export interface A500DataSetData {
  id: number
  createdAt: string
  updatedAt: string
  displaySoftwareVersion: string
  epochAt: Date
  type: A500SetType
  testSide: A500TestSides
  graphData?: A500RepDataPointData[]
  leftTestResultId: number
  rightTestResultId: number
}

export interface A500DataSetResponse extends AuthenticatedResponse {
  A500DataSet: A500DataSetData
}

export class A500DataSet extends Model {
  private readonly _a500DataSetData: A500DataSetData
  constructor (
    A500DataSetData: A500DataSetData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler)
    this._a500DataSetData = A500DataSetData
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

  public get type (): A500SetType {
    return this._a500DataSetData.type
  }

  public get testSide (): A500TestSides {
    return this._a500DataSetData.testSide
  }

  public get graphData (): A500RepDataPointData[] | undefined {
    return this._a500DataSetData.graphData
  }

  public get leftTestResultId (): number {
    return this._a500DataSetData.leftTestResultId
  }

  public get rightTestResultId (): number {
    return this._a500DataSetData.rightTestResultId
  }
}
