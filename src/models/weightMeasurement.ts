import { DeepReadonly } from '../lib/readonly'
import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum WeightMeasurementSorting {
  ID = 'id',
  Source = 'source',
  TakenAt = 'takenAt'
}

export interface WeightMeasurementData {
  id: number
  source: string
  takenAt: string
  metricWeight: number
  imperialWeight: number
  bodyFatPercentage: number
  bodyCompositionMeasurement?: BodyCompositionMeasurementData
}

export interface BodyCompositionMeasurementData {
  totalBodyWater: number
  intracellularWater: number
  extracellularWater: number
  extracellularWaterToTotalBodyWaterRatio: number
  dryLeanMass: number
  bodyFatMass: number
  leanBodyMass: number
  skeletalMuscleMass: number
  bodyMassIndex: number
  visceralFatLevel: number
  basalMetabolicRate: number
  leanBodyMassOfRightArm: number
  leanBodyMassPercentageOfRightArm: number
  leanBodyMassOfLeftArm: number
  leanBodyMassPercentageOfLeftArm: number
  leanBodyMassOfTrunk: number
  leanBodyMassPercentageOfTrunk: number
  leanBodyMassOfRightLeg: number
  leanBodyMassPercentageOfRightLeg: number
  leanBodyMassOfLeftLeg: number
  leanBodyMassPercentageOfLeftLeg: number
  bodyFatMassOfRightArm: number
  bodyFatMassPercentageOfRightArm: number
  bodyFatMassOfLeftArm: number
  bodyFatMassPercentageOfLeftArm: number
  bodyFatMassOfTrunk: number
  bodyFatMassPercentageOfTrunk: number
  bodyFatMassOfRightLeg: number
  bodyFatMassPercentageOfRightLeg: number
  bodyFatMassOfLeftLeg: number
  bodyFatMassPercentageOfLeftLeg: number
}

export interface WeightMeasurementResponse extends AuthenticatedResponse {
  weightMeasurement: WeightMeasurementData
}

export interface WeightMeasurementListResponse extends AuthenticatedResponse {
  weightMeasurements: WeightMeasurementData[]
  weightMeasurementsMeta: WeightMeasurementListResponseMeta
}

export interface WeightMeasurementListResponseMeta extends ListMeta {
  sort: WeightMeasurementSorting
}

export class WeightMeasurements extends UserModelList<WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponseMeta> {
  constructor (weightMeasurements: WeightMeasurementData[], weightMeasurementsMeta: WeightMeasurementListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(WeightMeasurement, weightMeasurements, weightMeasurementsMeta, sessionHandler, userId)
  }
}

export class WeightMeasurement extends Model {
  private _weightMeasurementData: WeightMeasurementData
  private _userId: number

  constructor (weightMeasurementData: WeightMeasurementData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._weightMeasurementData = weightMeasurementData
    this._userId = userId
  }

  private setWeightMeasurementData (weightMeasurementData: WeightMeasurementData) {
    this._weightMeasurementData = weightMeasurementData
  }

  async reload () {
    const { weightMeasurement } = await this.action('weightMeasurement:show', { userId: this._userId, id: this.id }) as WeightMeasurementResponse
    this.setWeightMeasurementData(weightMeasurement)
    return this
  }

  async delete () {
    await this.action('weightMeasurement:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._weightMeasurementData.id
  }

  get source () {
    return this._weightMeasurementData.source
  }

  get takenAt () {
    return new Date(this._weightMeasurementData.takenAt)
  }

  get metricWeight () {
    return this._weightMeasurementData.metricWeight
  }

  get imperialWeight () {
    return this._weightMeasurementData.imperialWeight
  }

  get bodyFatPercentage () {
    return this._weightMeasurementData.bodyFatPercentage
  }

  get bodyCompositionMeasurement () {
    return this._weightMeasurementData.bodyCompositionMeasurement ? { ...this._weightMeasurementData.bodyCompositionMeasurement } as DeepReadonly<BodyCompositionMeasurementData> : undefined
  }
}
