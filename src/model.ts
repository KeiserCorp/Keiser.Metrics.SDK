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

  protected action (action: string, params: Object = { }) {
    return this.sessionHandler.action(action, params)
  }
}

export interface ModelClass<Model> {
  new(x: any, sessionHandler: SessionHandler): Model
}

export class ModelList<Model, Data, Meta> extends Array<Model> {
  protected _meta: Meta

  constructor (type: ModelClass<Model>, items: Array<Data> | number, meta: Meta, sessionHandler: SessionHandler) {
    Array.isArray(items) ? super(...items.map(x => new type(x, sessionHandler))) : super(items)
    this._meta = meta
  }

  get meta () {
    return this._meta
  }
}
