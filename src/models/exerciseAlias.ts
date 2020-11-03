import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { StrengthExercise, StrengthExerciseData } from './strengthExercise'

export const enum ExerciseAliasType {
  Cardio = 'cardio',
  Strength = 'strength',
  Stretch = 'stretch'
}

export const enum ExerciseAliasSorting {
  ID = 'id',
  Alias = 'alias'
}

export interface ExerciseAliasData {
  id: number
  alias: string
  strengthExercise?: StrengthExerciseData
  cardioExercise?: any // To-Do: Add cardioExercise
  stretchExercise?: any // To-Do: Add stretchExercise
}

export interface ExerciseAliasResponse extends AuthenticatedResponse {
  exerciseAlias: ExerciseAliasData
}

export interface ExerciseAliasListResponse extends AuthenticatedResponse {
  exerciseAliases: ExerciseAliasData[]
  exerciseAliasesMeta: ExerciseAliasListResponseMeta
}

export interface ExerciseAliasListResponseMeta extends ListMeta {
  alias: string | undefined
  sort: ExerciseAliasSorting
}

export class ExerciseAliases extends ModelList<ExerciseAlias, ExerciseAliasData, ExerciseAliasListResponseMeta> {
  constructor (exerciseAliases: ExerciseAliasData[], exerciseAliasesMeta: ExerciseAliasListResponseMeta, sessionHandler: SessionHandler) {
    super(ExerciseAlias, exerciseAliases, exerciseAliasesMeta, sessionHandler)
  }
}

export class ExerciseAlias extends Model {
  protected _exerciseAliasData: ExerciseAliasData

  constructor (exerciseAliasData: ExerciseAliasData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._exerciseAliasData = exerciseAliasData
  }

  protected setExerciseAliasData (exerciseAliasData: ExerciseAliasData) {
    this._exerciseAliasData = exerciseAliasData
  }

  async reload () {
    const { exerciseAlias } = await this.action('exerciseAlias:show', { id: this._exerciseAliasData.id }) as ExerciseAliasResponse
    this.setExerciseAliasData(exerciseAlias)
    return this
  }

  get id () {
    return this._exerciseAliasData.id
  }

  get alias () {
    return this._exerciseAliasData.alias
  }

  get type () {
    if (this._exerciseAliasData.strengthExercise) {
      return ExerciseAliasType.Strength
    }
    if (this._exerciseAliasData.cardioExercise) {
      return ExerciseAliasType.Cardio
    }
    return ExerciseAliasType.Stretch
  }

  get strengthExercise () {
    return this._exerciseAliasData.strengthExercise ? new StrengthExercise(this._exerciseAliasData.strengthExercise, this.sessionHandler) : undefined
  }

  // get cardioExercise () {
  //   return this._exerciseAliasData.cardioExercise ? new CardioExercise(this._exerciseAliasData.cardioExercise, this.sessionHandler) : undefined
  // }

  // get stretchExercise () {
  //   return this._exerciseAliasData.stretchExercise ? new StretchExercise(this._exerciseAliasData.stretchExercise, this.sessionHandler) : undefined
  // }
}

/** @hidden */
export class PrivilegedExerciseAliases extends ModelList<PrivilegedExerciseAlias, ExerciseAliasData, ExerciseAliasListResponseMeta> {
  constructor (exerciseAliases: ExerciseAliasData[], exerciseAliasesMeta: ExerciseAliasListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExerciseAlias, exerciseAliases, exerciseAliasesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseAlias extends ExerciseAlias {
  constructor (exerciseAliasData: ExerciseAliasData, sessionHandler: SessionHandler) {
    super(exerciseAliasData, sessionHandler)
  }

  async update (params: { alias: string }) {
    const { exerciseAlias } = await this.action('exerciseAlias:update', { ...params, id: this.id }) as ExerciseAliasResponse
    this.setExerciseAliasData(exerciseAlias)
    return this
  }

  async delete () {
    await this.action('exerciseAlias:delete', { id : this.id })
  }
}
