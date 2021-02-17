import { Model } from "../model";
import { AuthenticatedResponse, SessionHandler } from "../session";
export interface A500TestResultData {
  id: number;
  averageVelocityLineM: number;
  averageVelocityLineB: number;
  averagePowerParabolaA: number;
  averagePowerParabolaH: number;
  averagePowerParabolaK: number;
  averageSlopeChanges: number;
  peakVelocityLineM: number;
  peakVelocityLineB: number;
  peakPowerParabolaA: number;
  peakPowerParabolaH: number;
  peakPowerParabolaK: number;
  peakSlopeChanges: number;
}

export interface A500TestResultResponse extends AuthenticatedResponse {
  A500TestResult: A500TestResultData;
}

export class A500TestResult extends Model {
  private readonly _a500TestResultData: A500TestResultData;
  constructor(
    A500TestResultData: A500TestResultData,
    sessionHandler: SessionHandler
  ) {
    super(sessionHandler);
    this._a500TestResultData = A500TestResultData;
  }
  public get id(): number {
    return this._a500TestResultData.id;
  }

  public get averageVelocityLineM(): number {
    return this._a500TestResultData.averageVelocityLineM;
  }

  public get averageVelocityLineB(): number {
    return this._a500TestResultData.averageVelocityLineB;
  }

  public get averagePowerParabolaA(): number {
    return this._a500TestResultData.averagePowerParabolaA;
  }

  public get averagePowerParabolaH(): number {
    return this._a500TestResultData.averagePowerParabolaH;
  }

  public get averagePowerParabolaK(): number {
    return this._a500TestResultData.averagePowerParabolaK;
  }

  public get averageSlopeChanges(): number {
    return this._a500TestResultData.averageSlopeChanges;
  }

  public get peakVelocityLineM(): number {
    return this._a500TestResultData.peakVelocityLineM;
  }

  public get peakVelocityLineB(): number {
    return this._a500TestResultData.peakVelocityLineB;
  }

  public get peakPowerParabolaA(): number {
    return this._a500TestResultData.peakPowerParabolaA;
  }

  public get peakPowerParabolaH(): number {
    return this._a500TestResultData.peakPowerParabolaH;
  }

  public get peakPowerParabolaK(): number {
    return this._a500TestResultData.peakPowerParabolaK;
  }

  public get peakSlopeChanges(): number {
    return this._a500TestResultData.peakSlopeChanges;
  }
}
