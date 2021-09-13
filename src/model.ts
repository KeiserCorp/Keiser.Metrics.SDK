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
  private readonly _modelName: string
  private readonly _subscriptionParams: Object
  private _subscriptionKey: string | null = null
  private readonly _onModelChangeEvent = new EventDispatcher<ModelChangeEvent>()

  constructor (modelName: string, subscriptionParams: Object, sessionHandler: SessionHandlerType) {
    super(sessionHandler)
    this._modelName = modelName
    this._subscriptionParams = subscriptionParams

    sessionHandler.connection.onConnectionChangeEvent.subscribe(e => void this.onConnectionChangeEvent(e))
    this._onModelChangeEvent.onSubscriptionCountChangeEvent.subscribe(e => void this.onSubscriptionCountChangeEvent(e))
  }

  private async onConnectionChangeEvent (connectionEvent: ConnectionEvent) {
    console.log(connectionEvent)
  }

  private async onSubscriptionCountChangeEvent ({ count }: {count: number}) {
    console.log(count, this.isSubscribed)
    if (count === 0 && this.isSubscribed) {
      await this.unsubscribe()
    } else if (count > 0 && !this.isSubscribed) {
      await this.subscribe()
    }
  }

  private get isSubscribed () {
    return this._subscriptionKey !== null
  }

  private async subscribe () {
    const { subscriptionKey } = await this.action(`${this._modelName}:subscribe`, this._subscriptionParams) as SubscriptionResponse
    this._subscriptionKey = subscriptionKey
  }

  private async unsubscribe () {
    await this.action(`${this._modelName}:unsubscribe`, this._subscriptionParams)
    this._subscriptionKey = null
  }

  get onModelChangeEvent () {
    return this._onModelChangeEvent.asEvent()
  }

  // get subscriptionKey () {
  //   return this._subscriptionKey
  // }
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
