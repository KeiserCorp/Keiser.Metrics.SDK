import { AuthenticatedResponse } from '../session'

export interface A500TimeSeriesPointData {
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

export interface A500TimeSeriesDataPointSideData {
  force: number
  position: number
  power: number
  velocity: number
  acceleration: number
  forceOfMassAcceleration: number
  mechanicalWeight: number
  rawPower: number
}

export interface A500TimeSeriesSampleDataPoint {
  left: A500TimeSeriesDataPointSideData
  right: A500TimeSeriesDataPointSideData
  timeSinceEpoch: number
}

export interface A500TimeSeriesPointResponse extends AuthenticatedResponse {
  A500TimeSeriesPoint: A500TimeSeriesPointData
}

export class A500TimeSeriesPoints {
  private readonly _timeSeriesPoints: A500TimeSeriesPoint[]

  constructor (timeSeriesPoints: A500TimeSeriesPointData[]) {
    this._timeSeriesPoints = timeSeriesPoints.map(timeSeriesPoint => new A500TimeSeriesPoint(timeSeriesPoint))
  }

  get timeSeriesPoints () {
    return this._timeSeriesPoints
  }
}

export class A500TimeSeriesPoint {
  private readonly _a500TimeSeriesPointData: A500TimeSeriesPointData
  private readonly _left: A500TimeSeriesDataPointSideData
  private readonly _right: A500TimeSeriesDataPointSideData

  constructor (a500TimeSeriesPointData: A500TimeSeriesPointData) {
    this._a500TimeSeriesPointData = a500TimeSeriesPointData
    this._left = {
      position: a500TimeSeriesPointData.leftPosition,
      power: a500TimeSeriesPointData.leftPower,
      force: a500TimeSeriesPointData.leftForce,
      velocity: a500TimeSeriesPointData.leftVelocity,
      acceleration: a500TimeSeriesPointData.leftAcceleration,
      forceOfMassAcceleration: a500TimeSeriesPointData.leftForceOfMassAcceleration,
      mechanicalWeight: a500TimeSeriesPointData.leftMechanicalWeight,
      rawPower: a500TimeSeriesPointData.leftPosition
    }
    this._right = {
      position: a500TimeSeriesPointData.rightPosition,
      power: a500TimeSeriesPointData.rightPower,
      force: a500TimeSeriesPointData.rightForce,
      velocity: a500TimeSeriesPointData.rightVelocity,
      acceleration: a500TimeSeriesPointData.rightAcceleration,
      forceOfMassAcceleration: a500TimeSeriesPointData.rightForceOfMassAcceleration,
      mechanicalWeight: a500TimeSeriesPointData.rightMechanicalWeight,
      rawPower: a500TimeSeriesPointData.rightPosition
    }
  }

  get id() {
    return this._a500TimeSeriesPointData.id
  }

  get timeSinceEpoch () {
    return this._a500TimeSeriesPointData.timeSinceEpoch
  }

  get left () {
    return new A500TimeSeriesDataPointSide(this._left)
  }

  get right () {
    return new A500TimeSeriesDataPointSide(this._right)
  }
}

export class A500TimeSeriesDataPointSide {
  private readonly _timeSeriesDataPointSideData: A500TimeSeriesDataPointSideData

  constructor (timeSeriesDataPointSideData: A500TimeSeriesDataPointSideData) {
    this._timeSeriesDataPointSideData = timeSeriesDataPointSideData
  }

  get position () {
    return this._timeSeriesDataPointSideData.position
  }

  get power () {
    return this._timeSeriesDataPointSideData.power
  }

  get force () {
    return this._timeSeriesDataPointSideData.force
  }

  get velocity () {
    return this._timeSeriesDataPointSideData.velocity
  }

  get acceleration () {
    return this._timeSeriesDataPointSideData.acceleration
  }

  get forceOfMassAcceleration () {
    return this._timeSeriesDataPointSideData.forceOfMassAcceleration
  }

  get mechanicalWeight () {
    return this._timeSeriesDataPointSideData.mechanicalWeight
  }
}
