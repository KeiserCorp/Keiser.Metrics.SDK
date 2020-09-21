import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Exercise, ExerciseData } from './exercise'

export const enum CardioMachineLine {
  MSeries = 'mSeries'
}

export const enum CardioMachineParseCode {
  MSeries6 = 'ms6',
  MSeries6Extended = 'ms6e'
}

export const enum CardioMachineSorting {
  ID = 'id',
  Name = 'name'
}

export interface CardioMachineModelData {
  model: string
}

export interface CardioMachineData {
  id: number
  name: string
  line: CardioMachineLine
  parseCode: CardioMachineParseCode
  exercise?: ExerciseData
}

export interface CardioMachineResponse extends AuthenticatedResponse {
  cardioMachine: CardioMachineData
}

export interface CardioMachineListResponse extends AuthenticatedResponse {
  cardioMachines: CardioMachineData[]
  cardioMachinesMeta: CardioMachineListResponseMeta
}

export interface CardioMachineListResponseMeta extends ListMeta {
  name: string | undefined
  sort: CardioMachineSorting
}

export class CardioMachines extends ModelList<CardioMachine, CardioMachineData, CardioMachineListResponseMeta> {
  constructor (cardioMachines: CardioMachineData[], cardioMachinesMeta: CardioMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(CardioMachine, cardioMachines, cardioMachinesMeta, sessionHandler)
  }
}

export class CardioMachine extends Model {
  private _cardioMachineData: CardioMachineData

  constructor (cardioMachineData: CardioMachineData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._cardioMachineData = cardioMachineData
  }

  protected setCardioMachineData (cardioMachineData: CardioMachineData) {
    this._cardioMachineData = cardioMachineData
  }

  async reload () {
    const { cardioMachine } = await this.action('cardioMachine:show', { id: this._cardioMachineData.id }) as CardioMachineResponse
    this.setCardioMachineData(cardioMachine)
    return this
  }

  get id () {
    return this._cardioMachineData.id
  }

  get name () {
    return this._cardioMachineData.name
  }

  get line () {
    return this._cardioMachineData.line
  }

  get parseCode () {
    return this._cardioMachineData.parseCode
  }

  get exercise () {
    return this._cardioMachineData.exercise ? new Exercise(this._cardioMachineData.exercise, this.sessionHandler) : undefined
  }
}

/** @hidden */
export class PrivilegedCardioMachines extends ModelList<PrivilegedCardioMachine, CardioMachineData, CardioMachineListResponseMeta> {
  constructor (cardioMachines: CardioMachineData[], cardioMachinesMeta: CardioMachineListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedCardioMachine, cardioMachines, cardioMachinesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedCardioMachine extends CardioMachine {
  constructor (cardioMachineData: CardioMachineData, sessionHandler: SessionHandler) {
    super(cardioMachineData, sessionHandler)
  }

  async update (params: { name: string, line: CardioMachineLine, parseCode: CardioMachineParseCode, exerciseId?: number }) {
    const { cardioMachine } = await this.action('cardioMachine:update', { ...params, id: this.id }) as CardioMachineResponse
    this.setCardioMachineData(cardioMachine)
    return this
  }

  async delete () {
    await this.action('cardioMachine:delete', { id : this.id })
  }
}
