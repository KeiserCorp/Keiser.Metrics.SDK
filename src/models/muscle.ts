import { Model } from '../model'
import { SessionHandler } from '../session'

export const enum MuscleGroup {
  Abs = 'abs',
  Back = 'back',
  Biceps = 'biceps',
  Calves = 'calves',
  Chest = 'chest',
  Forearms = 'forearms',
  Glutes = 'glutes',
  Hamstrings = 'hamstrings',
  HipFlexors = 'hipFlexors',
  Neck = 'neck',
  Shoulders = 'shoulders',
  Triceps = 'triceps',
  UpperBack = 'upperBack'
}

export const enum MuscleArea {
  LowerBody = 'lowerBody',
  UpperBody = 'upperBody',
  Core = 'core'
}

export const enum MuscleTargetLevel {
  Primary = 'primary',
  Secondary = 'secondary',
  Stabilizer = 'stabilizer'
}

export interface MuscleData {
  id: number
  muscle: string
  group: MuscleGroup
  area: MuscleArea
  targetLevel: MuscleTargetLevel
}

export class BaseMuscle extends Model {
  protected _muscleData: MuscleData

  constructor (muscleData: MuscleData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._muscleData = muscleData
  }

  get id () {
    return this._muscleData.id
  }

  get muscle () {
    return this._muscleData.muscle
  }

  get group () {
    return this._muscleData.group
  }

  get area () {
    return this._muscleData.area
  }

  get targetLevel () {
    return this._muscleData.targetLevel
  }
}
