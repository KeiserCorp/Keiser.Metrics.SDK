import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioExercise, CardioExerciseData } from './cardioExercise'
import { CardioMachine, CardioMachineData } from './cardioMachine'

export const enum CardioExerciseVariantType {
  Normal = 'normal'
}

export const enum CardioExerciseVariantSorting {
  ID = 'id',
  Variant = 'variant'
}

export interface CardioExerciseVariantData {
  id: number
  variant: CardioExerciseVariantType
  instructionalImage: string
  instructionalVideo: string
  cardioExercise?: CardioExerciseData
  cardioMachine?: CardioMachineData
  exerciseOrdinalSetAssignments?: any[] // To-Do: Add OrdinalSetAssignment
}

export interface CardioExerciseVariantResponse extends AuthenticatedResponse {
  cardioExerciseVariant: CardioExerciseVariantData
}

export interface CardioExerciseVariantListResponse extends AuthenticatedResponse {
  cardioExerciseVariants: CardioExerciseVariantData[]
  cardioExerciseVariantsMeta: CardioExerciseVariantListResponseMeta
}

export interface CardioExerciseVariantListResponseMeta extends ListMeta {
  cardioExerciseId?: number
  cardioMachineId?: number
  variant?: string
  sort: CardioExerciseVariantSorting
}

export class CardioExerciseVariants extends ModelList<CardioExerciseVariant, CardioExerciseVariantData, CardioExerciseVariantListResponseMeta> {
  constructor (CardioExerciseVariants: CardioExerciseVariantData[], CardioExerciseVariantsMeta: CardioExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(CardioExerciseVariant, CardioExerciseVariants, CardioExerciseVariantsMeta, sessionHandler)
  }
}

export class CardioExerciseVariant extends Model {
  protected _cardioExerciseVariantData: CardioExerciseVariantData

  constructor (cardioExerciseVariantData: CardioExerciseVariantData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._cardioExerciseVariantData = cardioExerciseVariantData
  }

  protected setCardioExerciseVariant (cardioExerciseVariantData: CardioExerciseVariantData) {
    this._cardioExerciseVariantData = cardioExerciseVariantData
  }

  async reload () {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:show', { id: this.id }) as CardioExerciseVariantResponse
    this.setCardioExerciseVariant(cardioExerciseVariant)
    return this
  }

  get id () {
    return this._cardioExerciseVariantData.id
  }

  get variant () {
    return this._cardioExerciseVariantData.variant
  }

  get instructionalImage () {
    return this._cardioExerciseVariantData.instructionalImage
  }

  get instructionalVideo () {
    return this._cardioExerciseVariantData.instructionalVideo
  }

  get cardioExercise () {
    return this._cardioExerciseVariantData.cardioExercise ? new CardioExercise(this._cardioExerciseVariantData.cardioExercise, this.sessionHandler) : undefined
  }

  get cardioMachine () {
    return this._cardioExerciseVariantData.cardioMachine ? new CardioMachine(this._cardioExerciseVariantData.cardioMachine, this.sessionHandler) : undefined
  }
}

/** @hidden */
export class PrivilegedCardioExerciseVariants extends ModelList<PrivilegedCardioExerciseVariant, CardioExerciseVariantData, CardioExerciseVariantListResponseMeta> {
  constructor (cardioExerciseVariants: CardioExerciseVariantData[], cardioExerciseVariantsMeta: CardioExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedCardioExerciseVariant, cardioExerciseVariants, cardioExerciseVariantsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedCardioExerciseVariant extends CardioExerciseVariant {
  async update (params: { variant: CardioExerciseVariantType, instructionalImage?: string, instructionalVideo?: string }) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:update', { ...params, id: this.id }) as CardioExerciseVariantResponse
    this.setCardioExerciseVariant(cardioExerciseVariant)
    return this
  }

  async delete () {
    await this.action('cardioExerciseVariant:delete', { id : this.id })
  }
}
