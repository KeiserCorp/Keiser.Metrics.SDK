import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioMachine, CardioMachineData } from './cardioMachine'
import { ExerciseVariant, ExerciseVariantData } from './exerciseVariant'

export const enum CardioExerciseSorting {
  ID = 'id',
  ImageUri = 'imageUri',
  InstructionalVideoUri = 'instructionalVideoUri'
}

export interface CardioExerciseData {
  id: number
  imageUri: string | null
  instructionalVideoUri: string | null
  exerciseVariant?: ExerciseVariantData
  cardioMachine?: CardioMachineData
  exerciseOrdinalSetAssignments?: object[] // To-Do: Add Ordinal Set Assignment Model
}

export interface CardioExerciseResponse extends AuthenticatedResponse {
  cardioExercise: CardioExerciseData
}

export interface CardioExerciseListResponse extends AuthenticatedResponse {
  cardioExercises: CardioExerciseData[]
  cardioExercisesMeta: CardioExerciseListResponseMeta
}

export interface CardioExerciseListResponseMeta extends ListMeta {
  cardioMachineId?: number
  imageUri?: string
  instructionalVideoUri?: string
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

  get imageUri () {
    return this._cardioExerciseData.imageUri
  }

  get instructionalVideoUri () {
    return this._cardioExerciseData.instructionalVideoUri
  }

  get exerciseVariant () {
    return this._cardioExerciseData.exerciseVariant ? new ExerciseVariant(this._cardioExerciseData.exerciseVariant, this.sessionHandler) : undefined
  }

  get cardioMachine () {
    return this._cardioExerciseData.cardioMachine ? new CardioMachine(this._cardioExerciseData.cardioMachine, this.sessionHandler) : undefined
  }

  // get exerciseOrdinalSetAssignments () {
  //   return this._cardioExerciseData.exerciseVariant ? new ExerciseVariant(this._cardioExerciseData.exerciseVariant, this.sessionHandler) : undefined
  // }
}

/** @hidden */
export class PrivilegedCardioExercises extends ModelList<PrivilegedCardioExercise, CardioExerciseData, CardioExerciseListResponseMeta> {
  constructor (cardioExercises: CardioExerciseData[], cardioExercisesMeta: CardioExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedCardioExercise, cardioExercises, cardioExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedCardioExercise extends CardioExercise {
  constructor (cardioExerciseData: CardioExerciseData, sessionHandler: SessionHandler) {
    super(cardioExerciseData, sessionHandler)
  }

  async update (params: { imageUri: string, instructionalVideoUri: string }) {
    const { cardioExercise } = await this.action('cardioExercise:update', { ...params, id: this.id }) as CardioExerciseResponse
    this.setCardioExerciseData(cardioExercise)
    return this
  }

  async delete () {
    await this.action('cardioExercise:delete', { id : this.id })
  }
}
