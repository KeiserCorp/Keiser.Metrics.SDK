import { eject } from '../lib/eject'

export interface BaseA500TimeSeriesPointDataDual {
  id: number
  timeSinceEpoch: number
  leftPosition: number
  leftPower: number
  leftVelocity: number
  leftAcceleration: number
  leftForceOfMassAcceleration: number
  leftMechanicalWeight: number
  leftRawPower: number
  rightPosition: number
  rightPower: number
  rightVelocity: number
  rightAcceleration: number
  rightForceOfMassAcceleration: number
  rightMechanicalWeight: number
  rightRawPower: number
}

export interface BaseA500TimeSeriesPointDataDualRotary {
  leftTorque: number
  leftForce: null
  rightTorque: number
  rightForce: null
}

export interface BaseA500TimeSeriesPointDataDualLinear {
  leftTorque: null
  leftForce: number
  rightTorque: null
  rightForce: number
}

export interface BaseA500TimeSeriesPointDataLeftOnly {
  id: number
  timeSinceEpoch: number
  leftPosition: number
  leftPower: number
  leftVelocity: number
  leftAcceleration: number
  leftForceOfMassAcceleration: number
  leftMechanicalWeight: number
  leftRawPower: number
  rightPosition: null
  rightPower: null
  rightVelocity: null
  rightAcceleration: null
  rightForceOfMassAcceleration: null
  rightMechanicalWeight: null
  rightRawPower: null
}

export interface BaseA500TimeSeriesPointDataLeftOnlyRotary {
  leftTorque: number
  leftForce: null
  rightTorque: null
  rightForce: null
}

export interface BaseA500TimeSeriesPointDataLeftOnlyLinear {
  leftTorque: null
  leftForce: number
  rightTorque: null
  rightForce: null
}

export type A500TimeSeriesPointData = (BaseA500TimeSeriesPointDataDual & (BaseA500TimeSeriesPointDataDualRotary | BaseA500TimeSeriesPointDataDualLinear)) | (BaseA500TimeSeriesPointDataLeftOnly & (BaseA500TimeSeriesPointDataLeftOnlyRotary | BaseA500TimeSeriesPointDataLeftOnlyLinear))

export interface BaseA500TimeSeriesDataPointSideData {
  position: number
  power: number
  velocity: number
  acceleration: number
  forceOfMassAcceleration: number
  mechanicalWeight: number
  rawPower: number
}

export interface A500TimeSeriesDataPointSideRotaryData extends BaseA500TimeSeriesDataPointSideData {
  torque: number
}

export interface A500TimeSeriesDataPointSideLinearData extends BaseA500TimeSeriesDataPointSideData {
  force: number
}

export type A500TimeSeriesDataPointSideData = A500TimeSeriesDataPointSideRotaryData | A500TimeSeriesDataPointSideLinearData

export interface BaseA500TimeSeriesPointRotarySample {
  timeSinceEpoch: number
  left: A500TimeSeriesDataPointSideRotaryData
  right: A500TimeSeriesDataPointSideRotaryData | null
}

export interface BaseA500TimeSeriesPointLinearSample {
  timeSinceEpoch: number
  left: A500TimeSeriesDataPointSideLinearData
  right: A500TimeSeriesDataPointSideLinearData | null
}

export type A500TimeSeriesPointSample = BaseA500TimeSeriesPointRotarySample | BaseA500TimeSeriesPointLinearSample

export class A500TimeSeriesPoint {
  private readonly _a500TimeSeriesPointData: A500TimeSeriesPointData
  private readonly _leftA500TimeSeriesDataPointSide: A500TimeSeriesDataPointSide
  private readonly _rightA500TimeSeriesDataPointSide: A500TimeSeriesDataPointSide | null

  constructor (a500TimeSeriesPointData: A500TimeSeriesPointData) {
    this._a500TimeSeriesPointData = a500TimeSeriesPointData
    if (this._a500TimeSeriesPointData.leftTorque !== null) {
      this._leftA500TimeSeriesDataPointSide = new A500TimeSeriesDataPointSideRotary({
        position: this._a500TimeSeriesPointData.leftPosition,
        power: this._a500TimeSeriesPointData.leftPower,
        torque: this._a500TimeSeriesPointData.leftTorque,
        velocity: this._a500TimeSeriesPointData.leftVelocity,
        acceleration: this._a500TimeSeriesPointData.leftAcceleration,
        forceOfMassAcceleration: this._a500TimeSeriesPointData.leftForceOfMassAcceleration,
        mechanicalWeight: this._a500TimeSeriesPointData.leftMechanicalWeight,
        rawPower: this._a500TimeSeriesPointData.leftRawPower
      })
    } else {
      this._leftA500TimeSeriesDataPointSide = new A500TimeSeriesDataPointSideLinear({
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

    if (this._a500TimeSeriesPointData.rightPosition === null) {
      this._rightA500TimeSeriesDataPointSide = null
    } else {
      if (this._a500TimeSeriesPointData.rightTorque !== null) {
        this._rightA500TimeSeriesDataPointSide = new A500TimeSeriesDataPointSideRotary({
          position: this._a500TimeSeriesPointData.rightPosition,
          power: this._a500TimeSeriesPointData.rightPower,
          torque: this._a500TimeSeriesPointData.rightTorque,
          velocity: this._a500TimeSeriesPointData.rightVelocity,
          acceleration: this._a500TimeSeriesPointData.rightAcceleration,
          forceOfMassAcceleration: this._a500TimeSeriesPointData.rightForceOfMassAcceleration,
          mechanicalWeight: this._a500TimeSeriesPointData.rightMechanicalWeight,
          rawPower: this._a500TimeSeriesPointData.rightRawPower
        })
      } else {
        this._rightA500TimeSeriesDataPointSide = new A500TimeSeriesDataPointSideLinear({
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

  ejectData () {
    return eject(this._a500TimeSeriesPointData)
  }

  get id () {
    return this._a500TimeSeriesPointData.id
  }

  timeSinceEpoch () {
    return this._a500TimeSeriesPointData.timeSinceEpoch
  }

  get left () {
    return this._leftA500TimeSeriesDataPointSide
  }

  get right () {
    return this._rightA500TimeSeriesDataPointSide
  }
}

export abstract class BaseA500TimeSeriesDataPointSide {
  protected abstract readonly _timeSeriesDataPointSideData: A500TimeSeriesDataPointSideData

  get position () {
    return this._timeSeriesDataPointSideData.position
  }

  get power () {
    return this._timeSeriesDataPointSideData.power
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

export class A500TimeSeriesDataPointSideLinear extends BaseA500TimeSeriesDataPointSide {
  protected readonly _timeSeriesDataPointSideData: A500TimeSeriesDataPointSideLinearData

  constructor (timeSeriesDataPointSideData: A500TimeSeriesDataPointSideLinearData) {
    super()
    this._timeSeriesDataPointSideData = timeSeriesDataPointSideData
  }

  get force () {
    return this._timeSeriesDataPointSideData.force
  }
}

export class A500TimeSeriesDataPointSideRotary extends BaseA500TimeSeriesDataPointSide {
  protected readonly _timeSeriesDataPointSideData: A500TimeSeriesDataPointSideRotaryData

  constructor (timeSeriesDataPointSideData: A500TimeSeriesDataPointSideRotaryData) {
    super()
    this._timeSeriesDataPointSideData = timeSeriesDataPointSideData
  }

  get torque () {
    return this._timeSeriesDataPointSideData.torque
  }
}

export type A500TimeSeriesDataPointSide = A500TimeSeriesDataPointSideLinear | A500TimeSeriesDataPointSideRotary
