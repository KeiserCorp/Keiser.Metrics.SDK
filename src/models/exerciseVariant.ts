import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Exercise, ExerciseData } from './exercise'

export const enum ExerciseVariantType {
  Normal = 'normal',
  SingleArm = 'singleArm',
  SingleLeg = 'singleLeg',
  SingleArmSingleLeg = 'singleArmSingleLeg',
  Alternate = 'alternate'
}

export const enum ExerciseLaterality {
  Bilateral = 'bilateral',
  Unilateral = 'unilateral',
  Combination = 'combination'
}

export const enum ExerciseMovement {
  Isolation = 'isolation',
  Compound = 'compound'
}

export const enum ExercisePlane {
  Sagittal = 'sagittal',
  Frontal = 'frontal',
  Transverse = 'transverse'
}

export const enum ExerciseVariantSorting {
  ID = 'id',
  Variant = 'variant',
  Laterality = 'laterality',
  Movement = 'movement',
  Plane = 'plane'
}

export interface ExerciseVariantData {
  id: number
  variant: ExerciseVariantType
  laterality: ExerciseLaterality
  movement: ExerciseMovement
  plane: ExercisePlane
  exercise?: ExerciseData
  strengthExercises?: any[] // To-Do: Add Strength Exercise
  cardioExercises?: any[] // To-Do: Add Cardio Exercise
  stretchExercises?: any[] // To-Do: Add Stretch Exercise
}

export interface ExerciseVariantResponse extends AuthenticatedResponse {
  exerciseVariant: ExerciseVariantData
}

export interface ExerciseVariantListResponse extends AuthenticatedResponse {
  exerciseVariants: ExerciseVariantData[]
  exerciseVariantsMeta: ExerciseVariantListResponseMeta
}

export interface ExerciseVariantListResponseMeta extends ListMeta {
  variant?: ExerciseVariantType
  laterality?: ExerciseLaterality
  movement?: ExerciseMovement
  plane?: ExercisePlane
  sort: ExerciseVariantSorting
}

export class ExerciseVariants extends ModelList<ExerciseVariant, ExerciseVariantData, ExerciseVariantListResponseMeta> {
  constructor (exerciseVariants: ExerciseVariantData[], exerciseVariantsMeta: ExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(ExerciseVariant, exerciseVariants, exerciseVariantsMeta, sessionHandler)
  }
}

export class ExerciseVariant extends Model {
  protected _exerciseVariantData: ExerciseVariantData

  constructor (exerciseVariantData: ExerciseVariantData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._exerciseVariantData = exerciseVariantData
  }

  protected setExerciseVariantData (exerciseVariantData: ExerciseVariantData) {
    this._exerciseVariantData = exerciseVariantData
  }

  async reload () {
    const { exerciseVariant } = await this.action('exerciseVariant:show', { id: this._exerciseVariantData.id }) as ExerciseVariantResponse
    this.setExerciseVariantData(exerciseVariant)
    return this
  }

  get id () {
    return this._exerciseVariantData.id
  }

  get variant () {
    return this._exerciseVariantData.variant
  }

  get laterality () {
    return this._exerciseVariantData.laterality
  }

  get movement () {
    return this._exerciseVariantData.movement
  }

  get plane () {
    return this._exerciseVariantData.plane
  }

  get exercise () {
    return this._exerciseVariantData.exercise ? new Exercise(this._exerciseVariantData.exercise, this.sessionHandler) : undefined
  }

  // get strengthExercises () {
  //   return this._exerciseVariantData.exerciseVariant ? new ExerciseVariant(this._exerciseVariantData.exerciseVariant, this.sessionHandler) : undefined
  // }
}

/** @hidden */
export class PrivilegedExerciseVariants extends ModelList<PrivilegedExerciseVariant, ExerciseVariantData, ExerciseVariantListResponseMeta> {
  constructor (exerciseVariants: ExerciseVariantData[], exerciseVariantsMeta: ExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExerciseVariant, exerciseVariants, exerciseVariantsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseVariant extends ExerciseVariant {
  constructor (exerciseVariantData: ExerciseVariantData, sessionHandler: SessionHandler) {
    super(exerciseVariantData, sessionHandler)
  }

  async update (params: { exerciseId: number, variant: ExerciseVariantType, laterality: ExerciseLaterality, movement: ExerciseMovement, plane: ExercisePlane }) {
    const { exerciseVariant } = await this.action('exerciseVariant:update', { ...params, id: this.id }) as ExerciseVariantResponse
    this.setExerciseVariantData(exerciseVariant)
    return this
  }

  async delete () {
    await this.action('exerciseVariant:delete', { id : this.id })
  }
}
