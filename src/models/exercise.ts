import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum ExerciseType {
  Cardio = 'cardio',
  Strength = 'strength'
}

export enum ExerciseSorting {
  ID = 'id',
  Name = 'name',
  Type = 'type'
}

export interface ExerciseData {
  id: number
  name: string
  type: ExerciseType
  muscle: any // To-Do: Add muscle model
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
  constructor (exercises: ExerciseData[], exercisesMeta: ExerciseListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(Exercise, exercises, exercisesMeta, sessionHandler, userId)
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

  get id () {
    return this._exerciseData.id
  }

  get name () {
    return this._exerciseData.name
  }

  get type () {
    return this._exerciseData.type
  }
}

/** @hidden */
export class PrivilegedExercise extends Exercise {
  constructor (exerciseData: ExerciseData, sessionHandler: SessionHandler) {
    super(exerciseData, sessionHandler)
  }

  // To-Do: Add admin methods
}
