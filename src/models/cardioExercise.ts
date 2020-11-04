import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioMachineData } from './cardioMachine'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliasResponse } from './exerciseAlias'
import { CardioExerciseMuscle, CardioExerciseMuscleResponse, MuscleData, MuscleIdentifier, MuscleTargetLevel, PrivilegedCardioExerciseMuscle } from './muscle'

export const enum CardioExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias'
}

export interface CardioExerciseData {
  id: number
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  cardioExerciseVariants?: any[] // To-Do: Add cardioExerciseVariants
  cardioExerciseMuscles?: MuscleData[]
  cardioMachines?: CardioMachineData[]
}

export interface CardioExerciseResponse extends AuthenticatedResponse {
  cardioExercise: CardioExerciseData
}

export interface CardioExerciseListResponse extends AuthenticatedResponse {
  cardioExercises: CardioExerciseData[]
  cardioExercisesMeta: CardioExerciseListResponseMeta
}

export interface CardioExerciseListResponseMeta extends ListMeta {
  defaultAlias?: string
  sort: CardioExerciseSorting
}

export class CardioExercises extends ModelList<CardioExercise, CardioExerciseData, CardioExerciseListResponseMeta> {
  constructor (cardioExercises: CardioExerciseData[], cardioExercisesMeta: CardioExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(CardioExercise, cardioExercises, cardioExercisesMeta, sessionHandler)
  }
}

export class CardioExercise extends Model {
  protected _cardioExerciseData: CardioExerciseData

  constructor (cardioExerciseData: CardioExerciseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._cardioExerciseData = cardioExerciseData
  }

  protected setCardioExerciseData (cardioExerciseData: CardioExerciseData) {
    this._cardioExerciseData = cardioExerciseData
  }

  async reload () {
    const { cardioExercise } = await this.action('cardioExercise:show', { id: this._cardioExerciseData.id }) as CardioExerciseResponse
    this.setCardioExerciseData(cardioExercise)
    return this
  }

  get id () {
    return this._cardioExerciseData.id
  }

  get defaultExerciseAlias () {
    return new ExerciseAlias(this._cardioExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  get exerciseAliases () {
    return this._cardioExerciseData.exerciseAliases ? this._cardioExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  get cardioExerciseMuscles () {
    return this._cardioExerciseData.cardioExerciseMuscles ? this._cardioExerciseData.cardioExerciseMuscles.map(cardioExerciseMuscles => new CardioExerciseMuscle(cardioExerciseMuscles, this.sessionHandler)) : undefined
  }
}

/** @hidden */
export class PrivilegedCardioExercises extends ModelList<PrivilegedCardioExercise, CardioExerciseData, CardioExerciseListResponseMeta> {
  constructor (cardioExercises: CardioExerciseData[], cardioExercisesMeta: CardioExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedCardioExercise, cardioExercises, cardioExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedCardioExercise extends CardioExercise {
  async delete () {
    await this.action('cardioExercise:delete', { id : this.id })
  }

  async createExerciseAlias (params: {alias: string}) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias : params.alias, cardioExerciseId: this.id }) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async createCardioExerciseMuscle (params: {muscle: MuscleIdentifier, targetLevel: MuscleTargetLevel}) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:create', { ...params, cardioExerciseId: this.id }) as CardioExerciseMuscleResponse
    return new PrivilegedCardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getCardioExerciseMuscle (params: {id: number}) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { ...params }) as CardioExerciseMuscleResponse
    return new PrivilegedCardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }
}
