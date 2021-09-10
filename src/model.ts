import { AuthenticatedResponse, BaseSessionHandler, SessionHandler } from './session'

export interface ListMeta {
  sort: string
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
}

export interface SubscriptionResponse extends AuthenticatedResponse {
  subscriptionKey: string
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

export class SubscribableModel extends Model {
  private _subscriptionKey: string | null = null

  protected async _subscribe (model: string, params: Object) {
    const { subscriptionKey } = await this.action(`${model}:subscribe`, params) as SubscriptionResponse
    console.log(subscriptionKey)
    this._subscriptionKey = subscriptionKey
  }

  protected async _unsubscribe (model: string, params: Object) {
    await this.action(`${model}:unsubscribe`, params)
    this._subscriptionKey = null
  }

  get subscriptionKey () {
    return this._subscriptionKey
  }

  get isSubscribed () {
    return this._subscriptionKey !== null
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
