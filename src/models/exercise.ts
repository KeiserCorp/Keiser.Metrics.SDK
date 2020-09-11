import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Muscle, MuscleData } from './muscle'

export const enum ExerciseType {
  Cardio = 'cardio',
  Strength = 'strength',
  Stretch = 'stretch'
}

export const enum ExerciseSorting {
  ID = 'id',
  Name = 'name',
  Type = 'type'
}

export interface ExerciseData {
  id: number
  name: string
  type: ExerciseType
  muscles?: MuscleData[]
}

export interface ExerciseResponse extends AuthenticatedResponse {
  exercise: ExerciseData
}

export interface ExerciseListResponse extends AuthenticatedResponse {
  exercises: ExerciseData[]
  exercisesMeta: ExerciseListResponseMeta
}

export interface ExerciseListResponseMeta extends ListMeta {
  name: string | undefined
  sort: ExerciseSorting
}

export class Exercises extends ModelList<Exercise, ExerciseData, ExerciseListResponseMeta> {
  constructor (exercises: ExerciseData[], exercisesMeta: ExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(Exercise, exercises, exercisesMeta, sessionHandler)
  }
}

export class Exercise extends Model {
  protected _exerciseData: ExerciseData

  constructor (exerciseData: ExerciseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._exerciseData = exerciseData
  }

  protected setExerciseData (exerciseData: ExerciseData) {
    this._exerciseData = exerciseData
  }

  async reload () {
    const { exercise } = await this.action('exercise:show', { id: this._exerciseData.id }) as ExerciseResponse
    this.setExerciseData(exercise)
    return this
  }

  get id () {
    return this._exerciseData.id
  }

  get name () {
    return this._exerciseData.name
  }

  get type () {
    return this._exerciseData.type
  }

  get muscles () {
    return this._exerciseData.muscles ? this._exerciseData.muscles.map(muscleData => new Muscle(muscleData, this.sessionHandler)) : undefined
  }
}

/** @hidden */
export class PrivilegedExercises extends ModelList<PrivilegedExercise, ExerciseData, ExerciseListResponseMeta> {
  constructor (exercises: ExerciseData[], exercisesMeta: ExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExercise, exercises, exercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExercise extends Exercise {
  constructor (exerciseData: ExerciseData, sessionHandler: SessionHandler) {
    super(exerciseData, sessionHandler)
  }

  async update (params: { name: string, type: ExerciseType }) {
    const { exercise } = await this.action('exercise:update', { ...params, id: this.id }) as ExerciseResponse
    this.setExerciseData(exercise)
    return this
  }

  async delete () {
    await this.action('exercise:delete', { id : this.id })
  }

  async attachMuscle (params: { muscleId: number }) {
    const { exercise } = await this.action('exercise:attachMuscle', { ...params, id: this.id }) as ExerciseResponse
    this.setExerciseData(exercise)
    return this
  }

  async detachMuscle (params: { muscleId: number }) {
    const { exercise } = await this.action('exercise:detachMuscle', { ...params, id: this.id }) as ExerciseResponse
    this.setExerciseData(exercise)
    return this
  }
}
