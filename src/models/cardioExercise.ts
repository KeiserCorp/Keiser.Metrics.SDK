import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioExerciseMuscle, CardioExerciseMuscleListResponse, CardioExerciseMuscleResponse, CardioExerciseMuscles, PrivilegedCardioExerciseMuscle, PrivilegedCardioExerciseMuscles } from './cardioExerciseMuscle'
import { CardioExerciseVariant, CardioExerciseVariantData, CardioExerciseVariantListResponse, CardioExerciseVariantResponse, CardioExerciseVariants, CardioExerciseVariantSorting, CardioExerciseVariantType, PrivilegedCardioExerciseVariant, PrivilegedCardioExerciseVariants } from './cardioExerciseVariant'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './exerciseAlias'
import { MuscleData, MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from './muscle'

export const enum CardioExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias'
}

export interface CardioExerciseData {
  id: number
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  cardioExerciseVariants?: CardioExerciseVariantData[]
  cardioExerciseMuscles?: MuscleData[]
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

  eagerDefaultExerciseAlias () {
    return new ExerciseAlias(this._cardioExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  eagerExerciseAliases () {
    return typeof this._cardioExerciseData.exerciseAliases !== 'undefined' ? this._cardioExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  async getExerciseAliases (options: { alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, cardioExerciseId: this.id }) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  eagerCardioExerciseMuscles () {
    return typeof this._cardioExerciseData.cardioExerciseMuscles !== 'undefined' ? this._cardioExerciseData.cardioExerciseMuscles.map(cardioExerciseMuscles => new CardioExerciseMuscle(cardioExerciseMuscles, this.sessionHandler)) : undefined
  }

  async getCardioExerciseMuscles (options: { muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExerciseMuscles, cardioExerciseMusclesMeta } = await this.action('cardioExerciseMuscle:list', { ...options, cardioExerciseId: this.id }) as CardioExerciseMuscleListResponse
    return new CardioExerciseMuscles(cardioExerciseMuscles, cardioExerciseMusclesMeta, this.sessionHandler)
  }

  eagerCardioExerciseVariants () {
    return typeof this._cardioExerciseData.cardioExerciseVariants !== 'undefined' ? this._cardioExerciseData.cardioExerciseVariants.map(cardioExerciseVariant => new CardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)) : undefined
  }

  async getCardioExerciseVariants (options: { cardioExerciseId?: number, cardioMachineId?: number, variant?: CardioExerciseVariantType, sort?: CardioExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExerciseVariants, cardioExerciseVariantsMeta } = await this.action('cardioExerciseVariant:list', options) as CardioExerciseVariantListResponse
    return new CardioExerciseVariants(cardioExerciseVariants, cardioExerciseVariantsMeta, this.sessionHandler)
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
    await this.action('cardioExercise:delete', { id: this.id })
  }

  async getExerciseAliases (options: { alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, cardioExerciseId: this.id }) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async createExerciseAlias (params: { alias: string }) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias: params.alias, cardioExerciseId: this.id }) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getCardioExerciseMuscles (options: { muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExerciseMuscles, cardioExerciseMusclesMeta } = await this.action('cardioExerciseMuscle:list', { ...options, cardioExerciseId: this.id }) as CardioExerciseMuscleListResponse
    return new PrivilegedCardioExerciseMuscles(cardioExerciseMuscles, cardioExerciseMusclesMeta, this.sessionHandler)
  }

  async createCardioExerciseMuscle (params: { muscle: MuscleIdentifier, targetLevel: MuscleTargetLevel }) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:create', { ...params, cardioExerciseId: this.id }) as CardioExerciseMuscleResponse
    return new PrivilegedCardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getCardioExerciseVariants (options: { cardioExerciseId?: number, cardioMachineId?: number, variant?: CardioExerciseVariantType, sort?: CardioExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExerciseVariants, cardioExerciseVariantsMeta } = await this.action('cardioExerciseVariant:list', options) as CardioExerciseVariantListResponse
    return new PrivilegedCardioExerciseVariants(cardioExerciseVariants, cardioExerciseVariantsMeta, this.sessionHandler)
  }

  async createCardioExerciseVariant (params: { cardioMachineId?: number, variant: CardioExerciseVariantType, instructionalImage?: string | null, instructionalVideo?: string | null }) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:create', { ...params, cardioExerciseId: this.id }) as CardioExerciseVariantResponse
    return new PrivilegedCardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)
  }
}
