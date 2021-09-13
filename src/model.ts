import { ConnectionEvent } from './connection'
import { EventDispatcher } from './lib/event'
import { AuthenticatedResponse, BaseSessionHandler, SessionHandler } from './session'

export interface ListMeta {
  sort: string
  ascending: boolean
  limit: number
  offset: number
  totalCount: number
}

export interface ModelChangeEvent {
  model: string
  modelId: number
  mutation: 'create' | 'update' | 'delete'
  userId: number
  occurredAt: number
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

export abstract class SubscribableModel<SessionHandlerType extends BaseSessionHandler = SessionHandler> extends Model<SessionHandlerType> {
  private _subscriptionKey: string | null = null
  private readonly _onModelChangeEvent = new EventDispatcher<ModelChangeEvent>()

  constructor (sessionHandler: SessionHandlerType) {
    super(sessionHandler)
    sessionHandler.connection.onConnectionChangeEvent.subscribe(e => void this.onConnectionChangeEvent(e))
    this._onModelChangeEvent.onSubscriptionCountChangeEvent.subscribe(e => void this.onSubscriptionCountChangeEvent(e))
  }

  private async onConnectionChangeEvent (connectionEvent: ConnectionEvent) {
    console.log(connectionEvent)
  }

  private async onSubscriptionCountChangeEvent ({ count }: {count: number}) {
    console.log(count)
  }

  protected async _subscribe (model: string, params: Object) {
    const { subscriptionKey } = await this.action(`${model}:subscribe`, params) as SubscriptionResponse
    this._subscriptionKey = subscriptionKey
  }

  protected async _unsubscribe (model: string, params: Object) {
    await this.action(`${model}:unsubscribe`, params)
    this._subscriptionKey = null
  }

  abstract subscribe (): Promise<void>
  abstract unsubscribe (): Promise<void>

  get onModelChangeEvent () {
    return this._onModelChangeEvent.asEvent()
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
