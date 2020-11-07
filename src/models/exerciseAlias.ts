import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioExercise, CardioExerciseData } from './cardioExercise'
import { StrengthExercise, StrengthExerciseData } from './strengthExercise'
import { StretchExercise, StretchExerciseData } from './stretchExercise'

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
  cardioExercise?: CardioExerciseData
  stretchExercise?: StretchExerciseData
}

export interface ExerciseAliasResponse extends AuthenticatedResponse {
  exerciseAlias: ExerciseAliasData
}

export interface ExerciseAliasListResponse extends AuthenticatedResponse {
  exerciseAliases: ExerciseAliasData[]
  exerciseAliasesMeta: ExerciseAliasListResponseMeta
}

export interface ExerciseAliasListResponseMeta extends ListMeta {
  strengthExerciseId?: number
  cardioExerciseId?: number
  stretchExerciseId?: number
  alias?: string
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

  eagerStrengthExercise () {
    return this._exerciseAliasData.strengthExercise ? new StrengthExercise(this._exerciseAliasData.strengthExercise, this.sessionHandler) : undefined
  }

  eagerCardioExercise () {
    return this._exerciseAliasData.cardioExercise ? new CardioExercise(this._exerciseAliasData.cardioExercise, this.sessionHandler) : undefined
  }

  eagerStretchExercise () {
    return this._exerciseAliasData.stretchExercise ? new StretchExercise(this._exerciseAliasData.stretchExercise, this.sessionHandler) : undefined
  }
}

/** @hidden */
export class PrivilegedExerciseAliases extends ModelList<PrivilegedExerciseAlias, ExerciseAliasData, ExerciseAliasListResponseMeta> {
  constructor (exerciseAliases: ExerciseAliasData[], exerciseAliasesMeta: ExerciseAliasListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExerciseAlias, exerciseAliases, exerciseAliasesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseAlias extends ExerciseAlias {
  async update (params: { alias: string }) {
    const { exerciseAlias } = await this.action('exerciseAlias:update', { ...params, id: this.id }) as ExerciseAliasResponse
    this.setExerciseAliasData(exerciseAlias)
    return this
  }

  async delete () {
    await this.action('exerciseAlias:delete', { id : this.id })
  }
}
