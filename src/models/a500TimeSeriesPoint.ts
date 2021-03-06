export interface A500TimeSeriesPointDataDual {
  id: number
  timeSinceEpoch: number
  leftPosition: number
  leftPower: number
  leftForce: number
  leftVelocity: number
  leftAcceleration: number
  leftForceOfMassAcceleration: number
  leftMechanicalWeight: number
  leftRawPower: number
  rightPosition: number
  rightPower: number
  rightForce: number
  rightVelocity: number
  rightAcceleration: number
  rightForceOfMassAcceleration: number
  rightMechanicalWeight: number
  rightRawPower: number
}

export interface A500TimeSeriesPointDataLeftOnly {
  id: number
  timeSinceEpoch: number
  leftPosition: number
  leftPower: number
  leftForce: number
  leftVelocity: number
  leftAcceleration: number
  leftForceOfMassAcceleration: number
  leftMechanicalWeight: number
  leftRawPower: number
  rightPosition: null
  rightPower: null
  rightForce: null
  rightVelocity: null
  rightAcceleration: null
  rightForceOfMassAcceleration: null
  rightMechanicalWeight: null
  rightRawPower: null
}

export type A500TimeSeriesPointData = A500TimeSeriesPointDataDual | A500TimeSeriesPointDataLeftOnly

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

export interface A500TimeSeriesPointSample {
  timeSinceEpoch: number
  left: A500TimeSeriesDataPointSideData
  right: A500TimeSeriesDataPointSideData | null
}

export class A500TimeSeriesPoint {
  private readonly _a500TimeSeriesPointData: A500TimeSeriesPointData

  constructor (a500TimeSeriesPointData: A500TimeSeriesPointData) {
    this._a500TimeSeriesPointData = a500TimeSeriesPointData
  }

  ejectData () {
    return { ...this._a500TimeSeriesPointData }
  }

  get id () {
    return this._a500TimeSeriesPointData.id
  }

  get timeSinceEpoch () {
    return this._a500TimeSeriesPointData.timeSinceEpoch
  }

  get left () {
    return new A500TimeSeriesDataPointSide({
      position: this._a500TimeSeriesPointData.leftPosition,
      power: this._a500TimeSeriesPointData.leftPower,
      force: this._a500TimeSeriesPointData.leftForce,
      velocity: this._a500TimeSeriesPointData.leftVelocity,
      acceleration: this._a500TimeSeriesPointData.leftAcceleration,
      forceOfMassAcceleration: this._a500TimeSeriesPointData.leftForceOfMassAcceleration,
      mechanicalWeight: this._a500TimeSeriesPointData.leftMechanicalWeight,
      rawPower: this._a500TimeSeriesPointData.leftRawPower
    })
  }

  get right () {
    if (this._a500TimeSeriesPointData.rightPosition === null) {
      return null
    } else {
      return new A500TimeSeriesDataPointSide({
        position: this._a500TimeSeriesPointData.rightPosition,
        power: this._a500TimeSeriesPointData.rightPower,
        force: this._a500TimeSeriesPointData.rightForce,
        velocity: this._a500TimeSeriesPointData.rightVelocity,
        acceleration: this._a500TimeSeriesPointData.rightAcceleration,
        forceOfMassAcceleration: this._a500TimeSeriesPointData.rightForceOfMassAcceleration,
        mechanicalWeight: this._a500TimeSeriesPointData.rightMechanicalWeight,
        rawPower: this._a500TimeSeriesPointData.rightRawPower
      })
    }
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

  get rawPower () {
    return this._timeSeriesDataPointSideData.rawPower
  }
}
