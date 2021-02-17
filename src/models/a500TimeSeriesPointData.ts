import { Model } from "../model";
import { AuthenticatedResponse, SessionHandler } from "../session";
export interface A500TimeSeriesPointData {
  id: number;
  timeSinceEpoch: number;
  leftPosition: number;
  leftPower: number;
  leftForce: number;
  leftVelocity: number;
  leftAcceleration: number;
  leftForceOfMassAcceleration: number;
  leftMechanicalWeight: number;
  rightPosition: number;
  rightPower: number;
  rightForce: number;
  rightVelocity: number;
  rightAcceleration: number;
  rightForceOfMassAcceleration: number;
  rightMechanicalWeight: number;
}

export interface A500TimeSeriesPointResponse extends AuthenticatedResponse {
  A500TimeSeriesPoint: A500TimeSeriesPointData
}
export class A500TimeSeriesPoint extends Model {
  private readonly _a500TimeSeriesPointData: A500TimeSeriesPointData;
  constructor(
    A500TimeSeriesPointData: A500TimeSeriesPointData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler);
    this._a500TimeSeriesPointData = A500TimeSeriesPointData;
  }

  public get id(): number {
    return this._a500TimeSeriesPointData.id;
  }

  public get timeSinceEpoch(): number {
    return this._a500TimeSeriesPointData.timeSinceEpoch;
  }

  public get leftPosition(): number {
    return this._a500TimeSeriesPointData.leftPosition;
  }

  public get leftPower(): number {
    return this._a500TimeSeriesPointData.leftPower;
  }

  public get leftForce(): number {
    return this._a500TimeSeriesPointData.leftForce;
  }

  public get leftVelocity(): number {
    return this._a500TimeSeriesPointData.leftVelocity;
  }

  public get leftAcceleration(): number {
    return this._a500TimeSeriesPointData.leftAcceleration;
  }

  public get leftForceOfMassAcceleration(): number {
    return this._a500TimeSeriesPointData.leftForceOfMassAcceleration;
  }

  public get leftMechanicalWeight(): number {
    return this._a500TimeSeriesPointData.leftMechanicalWeight;
  }

  public get rightPosition(): number {
    return this._a500TimeSeriesPointData.rightPosition;
  }

  public get rightPower(): number {
    return this._a500TimeSeriesPointData.rightPower;
  }

  public get rightForce(): number {
    return this._a500TimeSeriesPointData.rightForce;
  }

  public get rightVelocity(): number {
    return this._a500TimeSeriesPointData.rightVelocity;
  }

  public get rightAcceleration(): number {
    return this._a500TimeSeriesPointData.rightAcceleration;
  }

  public get rightForceOfMassAcceleration(): number {
    return this._a500TimeSeriesPointData.rightForceOfMassAcceleration;
  }

  public get rightMechanicalWeight(): number {
    return this._a500TimeSeriesPointData.rightMechanicalWeight;
  }
}
