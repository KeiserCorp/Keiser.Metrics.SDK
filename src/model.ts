import { EventDispatcher } from './lib/event'
import { BaseSessionHandler, ModelChangeEvent, ModelSubscribeParameters, SessionHandler } from './session'

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

export abstract class SubscribableModel<SessionHandlerType extends BaseSessionHandler = SessionHandler> extends Model<SessionHandlerType> {
  private _isSubscribed = false
  private _unsubscribe: (() => Promise<void>) | null = null
  private readonly _onModelChangeEvent = new EventDispatcher<ModelChangeEvent>()

  constructor (sessionHandler: SessionHandlerType) {
    super(sessionHandler)
    this._onModelChangeEvent.onSubscriptionCountChangeEvent.subscribe(e => void this.onSubscriptionCountChangeEvent(e))
  }

  protected abstract get subscribeParameters (): ModelSubscribeParameters

  private async onSubscriptionCountChangeEvent ({ count }: {count: number}) {
    if (count === 0 && this.isSubscribed) {
      await this.unsubscribe()
    } else if (count > 0 && !this.isSubscribed) {
      await this.subscribe()
    }
  }

  private dispatchModelChangeEvent (modelChangeEvent: ModelChangeEvent) {
    this._onModelChangeEvent.dispatchAsync(modelChangeEvent)
  }

  private async subscribe () {
    this._isSubscribed = true
    this._unsubscribe = await this.sessionHandler.subscribeToModel(this.subscribeParameters, e => this.dispatchModelChangeEvent(e))
  }

  private async unsubscribe () {
    if (this._unsubscribe !== null) {
      await this._unsubscribe()
      this._unsubscribe = null
    }
    this._isSubscribed = false
  }

  protected get isSubscribed () {
    return this._isSubscribed
  }

  get onModelChangeEvent () {
    return this._onModelChangeEvent.asEvent()
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
