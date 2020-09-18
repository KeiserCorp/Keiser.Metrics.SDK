import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseVariant, ExerciseVariantData } from './exerciseVariant'

export const enum StretchExerciseSorting {
  ID = 'id',
  ImageUri = 'imageUri',
  InstructionalVideoUri = 'instructionalVideoUri'
}

export interface StretchExerciseData {
  id: number
  imageUri: string | null
  instructionalVideoUri: string | null
  exerciseVariant?: ExerciseVariantData
  exerciseOrdinalSetAssignments?: object[] // To-Do: Add Ordinal Set Assignment Model
}

export interface StretchExerciseResponse extends AuthenticatedResponse {
  stretchExercise: StretchExerciseData
}

export interface StretchExerciseListResponse extends AuthenticatedResponse {
  stretchExercises: StretchExerciseData[]
  stretchExercisesMeta: StretchExerciseListResponseMeta
}

export interface StretchExerciseListResponseMeta extends ListMeta {
  imageUri?: string
  instructionalVideoUri?: string
  sort: StretchExerciseSorting
}

export class StretchExercises extends ModelList<StretchExercise, StretchExerciseData, StretchExerciseListResponseMeta> {
  constructor (stretchExercises: StretchExerciseData[], stretchExercisesMeta: StretchExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(StretchExercise, stretchExercises, stretchExercisesMeta, sessionHandler)
  }
}

export class StretchExercise extends Model {
  protected _stretchExerciseData: StretchExerciseData

  constructor (stretchExerciseData: StretchExerciseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._stretchExerciseData = stretchExerciseData
  }

  protected setStretchExerciseData (stretchExerciseData: StretchExerciseData) {
    this._stretchExerciseData = stretchExerciseData
  }

  async reload () {
    const { stretchExercise } = await this.action('stretchExercise:show', { id: this._stretchExerciseData.id }) as StretchExerciseResponse
    this.setStretchExerciseData(stretchExercise)
    return this
  }

  get id () {
    return this._stretchExerciseData.id
  }

  get imageUri () {
    return this._stretchExerciseData.imageUri
  }

  get instructionalVideoUri () {
    return this._stretchExerciseData.instructionalVideoUri
  }

  get exerciseVariant () {
    return this._stretchExerciseData.exerciseVariant ? new ExerciseVariant(this._stretchExerciseData.exerciseVariant, this.sessionHandler) : undefined
  }

  // get exerciseOrdinalSetAssignments () {
  //   return this._stretchExerciseData.exerciseVariant ? new ExerciseVariant(this._stretchExerciseData.exerciseVariant, this.sessionHandler) : undefined
  // }
}

/** @hidden */
export class PrivilegedStretchExercises extends ModelList<PrivilegedStretchExercise, StretchExerciseData, StretchExerciseListResponseMeta> {
  constructor (stretchExercises: StretchExerciseData[], stretchExercisesMeta: StretchExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStretchExercise, stretchExercises, stretchExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStretchExercise extends StretchExercise {
  constructor (stretchExerciseData: StretchExerciseData, sessionHandler: SessionHandler) {
    super(stretchExerciseData, sessionHandler)
  }

  async update (params: { imageUri: string, instructionalVideoUri: string }) {
    const { stretchExercise } = await this.action('stretchExercise:update', { ...params, id: this.id }) as StretchExerciseResponse
    this.setStretchExerciseData(stretchExercise)
    return this
  }

  async delete () {
    await this.action('stretchExercise:delete', { id : this.id })
  }
}
