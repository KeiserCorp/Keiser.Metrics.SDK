import { SessionHandler } from './session'

export interface ListMeta {
  sort: string
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
}

export class Model {
  protected sessionHandler: SessionHandler

  constructor (sessionHandler: SessionHandler) {
    this.sessionHandler = sessionHandler
  }

  protected action (action: string, params: Object = {}) {
    return this.sessionHandler.action(action, params)
  }
}

export class ModelList<T, V> extends Array<T> {
  protected _meta: V

  constructor (items: Array<T>, meta: V) {
    super(...items)
    this._meta = meta
  }

  get meta () {
    return this._meta
  }
}
