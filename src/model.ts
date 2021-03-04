import { BaseSessionHandler, SessionHandler } from './session'

export interface ListMeta {
  sort: string
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
}

export class Model<SessionHandlerType extends BaseSessionHandler = SessionHandler> {
  protected sessionHandler: SessionHandlerType

  constructor (sessionHandler: SessionHandlerType) {
    this.sessionHandler = sessionHandler
  }

  protected async action (action: string, params: Object = { }) {
    return await this.sessionHandler.action(action, params)
  }
}

export type ModelClass<Model> = new(x: any, sessionHandler: any) => Model

export class ModelList<Model, Data, Meta> extends Array<Model> {
  protected _meta: Meta

  constructor (Type: ModelClass<Model>, items: Data[] | number, meta: Meta, sessionHandler: any) {
    Array.isArray(items) ? super(...items.map(x => new Type(x, sessionHandler))) : super(items)
    this._meta = meta
  }

  get meta () {
    return this._meta
  }
}
