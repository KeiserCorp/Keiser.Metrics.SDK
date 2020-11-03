import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliasResponse } from './exerciseAlias'

export const enum StretchExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias'
}

export interface StretchExerciseData {
  id: number
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  stretchExerciseVariants?: any[] // To-Do: Add stretchExerciseVariants
  stretchExerciseMuscles?: any[] // To-Do: Add stretchExerciseMuscles
}

export interface StretchExerciseResponse extends AuthenticatedResponse {
  stretchExercise: StretchExerciseData
}

export interface StretchExerciseListResponse extends AuthenticatedResponse {
  stretchExercises: StretchExerciseData[]
  stretchExercisesMeta: StretchExerciseListResponseMeta
}

export interface StretchExerciseListResponseMeta extends ListMeta {
  defaultAlias?: string
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

  get defaultExerciseAlias () {
    return new ExerciseAlias(this._stretchExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  get exerciseAliases () {
    return this._stretchExerciseData.exerciseAliases ? this._stretchExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  // get stretchExercises () {
  //   return this._stretchExerciseData.stretchExercise ? new StretchExercise(this._stretchExerciseData.stretchExercise, this.sessionHandler) : undefined
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

  // async update (params: { }) {
  //   const { stretchExercise } = await this.action('stretchExercise:update', { ...params, id: this.id }) as StretchExerciseResponse
  //   this.setStretchExerciseData(stretchExercise)
  //   return this
  // }

  async delete () {
    await this.action('stretchExercise:delete', { id : this.id })
  }

  async createExerciseAlias (params: {alias: string}) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias : params.alias, stretchExerciseId: this.id }) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }
}
