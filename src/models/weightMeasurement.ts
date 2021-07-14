import { ListMeta, Model, ModelList } from '../model'
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

export class WeightMeasurements extends ModelList<WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponseMeta> {
  constructor (weightMeasurements: WeightMeasurementData[], weightMeasurementsMeta: WeightMeasurementListResponseMeta, sessionHandler: SessionHandler) {
    super(WeightMeasurement, weightMeasurements, weightMeasurementsMeta, sessionHandler)
  }
}

export class WeightMeasurement extends Model {
  private _weightMeasurementData: WeightMeasurementData
  private _bodyCompositionMeasurement?: BodyCompositionMeasurement

  constructor (weightMeasurementData: WeightMeasurementData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._weightMeasurementData = weightMeasurementData
    this._bodyCompositionMeasurement = typeof this._weightMeasurementData.bodyCompositionMeasurement !== 'undefined' ? new BodyCompositionMeasurement(this._weightMeasurementData.bodyCompositionMeasurement) : undefined
  }

  private setWeightMeasurementData (weightMeasurementData: WeightMeasurementData) {
    this._weightMeasurementData = weightMeasurementData
    this._bodyCompositionMeasurement = typeof this._weightMeasurementData.bodyCompositionMeasurement !== 'undefined' ? new BodyCompositionMeasurement(this._weightMeasurementData.bodyCompositionMeasurement) : undefined
  }

  async reload () {
    const { weightMeasurement } = await this.action('weightMeasurement:show', { id: this.id }) as WeightMeasurementResponse
    this.setWeightMeasurementData(weightMeasurement)
    return this
  }

  async delete () {
    await this.action('weightMeasurement:delete', { id: this.id })
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

  /**
   * @returns Weight in kilograms
   */
  get metricWeight () {
    return this._weightMeasurementData.metricWeight
  }

  /**
   * @returns Weight in pounds
   */
  get imperialWeight () {
    return this._weightMeasurementData.imperialWeight
  }

  get bodyFatPercentage () {
    return this._weightMeasurementData.bodyFatPercentage
  }

  get bodyCompositionMeasurement () {
    return this._bodyCompositionMeasurement
  }
}

export class BodyCompositionMeasurement {
  private readonly _bodyCompositionMeasurementData: BodyCompositionMeasurementData

  constructor (bodyCompositionMeasurementData: BodyCompositionMeasurementData) {
    this._bodyCompositionMeasurementData = bodyCompositionMeasurementData
  }

  get totalBodyWater () {
    return this._bodyCompositionMeasurementData.totalBodyWater
  }

  get intracellularWater () {
    return this._bodyCompositionMeasurementData.intracellularWater
  }

  get extracellularWater () {
    return this._bodyCompositionMeasurementData.extracellularWater
  }

  get extracellularWaterToTotalBodyWaterRatio () {
    return this._bodyCompositionMeasurementData.extracellularWaterToTotalBodyWaterRatio
  }

  get dryLeanMass () {
    return this._bodyCompositionMeasurementData.dryLeanMass
  }

  get bodyFatMass () {
    return this._bodyCompositionMeasurementData.bodyFatMass
  }

  get leanBodyMass () {
    return this._bodyCompositionMeasurementData.leanBodyMass
  }

  get skeletalMuscleMass () {
    return this._bodyCompositionMeasurementData.skeletalMuscleMass
  }

  get bodyMassIndex () {
    return this._bodyCompositionMeasurementData.bodyMassIndex
  }

  get visceralFatLevel () {
    return this._bodyCompositionMeasurementData.visceralFatLevel
  }

  get basalMetabolicRate () {
    return this._bodyCompositionMeasurementData.basalMetabolicRate
  }

  get leanBodyMassOfRightArm () {
    return this._bodyCompositionMeasurementData.leanBodyMassOfRightArm
  }

  get leanBodyMassPercentageOfRightArm () {
    return this._bodyCompositionMeasurementData.leanBodyMassPercentageOfRightArm
  }

  get leanBodyMassOfLeftArm () {
    return this._bodyCompositionMeasurementData.leanBodyMassOfLeftArm
  }

  get leanBodyMassPercentageOfLeftArm () {
    return this._bodyCompositionMeasurementData.leanBodyMassPercentageOfLeftArm
  }

  get leanBodyMassOfTrunk () {
    return this._bodyCompositionMeasurementData.leanBodyMassOfTrunk
  }

  get leanBodyMassPercentageOfTrunk () {
    return this._bodyCompositionMeasurementData.leanBodyMassPercentageOfTrunk
  }

  get leanBodyMassOfRightLeg () {
    return this._bodyCompositionMeasurementData.leanBodyMassOfRightLeg
  }

  get leanBodyMassPercentageOfRightLeg () {
    return this._bodyCompositionMeasurementData.leanBodyMassPercentageOfRightLeg
  }

  get leanBodyMassOfLeftLeg () {
    return this._bodyCompositionMeasurementData.leanBodyMassOfLeftLeg
  }

  get leanBodyMassPercentageOfLeftLeg () {
    return this._bodyCompositionMeasurementData.leanBodyMassPercentageOfLeftLeg
  }

  get bodyFatMassOfRightArm () {
    return this._bodyCompositionMeasurementData.bodyFatMassOfRightArm
  }

  get bodyFatMassPercentageOfRightArm () {
    return this._bodyCompositionMeasurementData.bodyFatMassPercentageOfRightArm
  }

  get bodyFatMassOfLeftArm () {
    return this._bodyCompositionMeasurementData.bodyFatMassOfLeftArm
  }

  get bodyFatMassPercentageOfLeftArm () {
    return this._bodyCompositionMeasurementData.bodyFatMassPercentageOfLeftArm
  }

  get bodyFatMassOfTrunk () {
    return this._bodyCompositionMeasurementData.bodyFatMassOfTrunk
  }

  get bodyFatMassPercentageOfTrunk () {
    return this._bodyCompositionMeasurementData.bodyFatMassPercentageOfTrunk
  }

  get bodyFatMassOfRightLeg () {
    return this._bodyCompositionMeasurementData.bodyFatMassOfRightLeg
  }

  get bodyFatMassPercentageOfRightLeg () {
    return this._bodyCompositionMeasurementData.bodyFatMassPercentageOfRightLeg
  }

  get bodyFatMassOfLeftLeg () {
    return this._bodyCompositionMeasurementData.bodyFatMassOfLeftLeg
  }

  get bodyFatMassPercentageOfLeftLeg () {
    return this._bodyCompositionMeasurementData.bodyFatMassPercentageOfLeftLeg
  }
}
