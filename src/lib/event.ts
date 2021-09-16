
interface IEventManagement {
  unsubscribe: () => void
  stopPropagation: () => void
}

interface ISubscribable<TypedEventHandler> {
  readonly count: number
  subscribe: (handler: TypedEventHandler) => () => void
  unsubscribe: (handler: TypedEventHandler) => void
  one: (handler: TypedEventHandler) => () => void
  has: (handler: TypedEventHandler) => boolean
  clear: () => void
}

interface ISubscription<TypedEventHandler> {
  readonly isExecuted: boolean
  readonly isOnce: boolean
  readonly handler: TypedEventHandler
}

type IEventHandler<TypedEventArgument> = (argument: TypedEventArgument, eventManager: IEventManagement) => void

type TypedEventArgument = any
type TypedEventHandler = IEventHandler<TypedEventArgument>

class DispatchError extends Error { }

class Subscription<TypedEventHandler> implements ISubscription<TypedEventHandler> {
  public isExecuted = false
  public handler: TypedEventHandler
  public isOnce: boolean

  constructor (handler: TypedEventHandler, isOnce: boolean) {
    this.handler = handler
    this.isOnce = isOnce
  }

  public execute (executeAsync: boolean, scope: any, argument: TypedEventArgument, eventManager: EventManagement) {
    if (!this.isOnce || !this.isExecuted) {
      this.isExecuted = true

      if (executeAsync) {
        setTimeout(() => (this.handler as any).apply(scope, [argument, eventManager]), 1)
      } else {
        (this.handler as any).apply(scope, [argument, eventManager])
      }
    }
  }
}

class EventManagement implements IEventManagement {
  public propagationStopped = false
  public unsubscribe: () => void

  constructor (unsubscribe: () => void) {
    this.unsubscribe = unsubscribe
  }

  public stopPropagation () {
    this.propagationStopped = true
  }
}

class DispatcherAsEventWrapper<TypedEventHandler> implements ISubscribable<TypedEventHandler> {
  private readonly _subscribe: (handler: TypedEventHandler) => () => void
  private readonly _unsubscribe: (handler: TypedEventHandler) => void
  private readonly _one: (handler: TypedEventHandler) => () => void
  private readonly _has: (handler: TypedEventHandler) => boolean
  private readonly _clear: () => void
  private readonly _count: () => number

  constructor (dispatcher: ISubscribable<TypedEventHandler>) {
    this._subscribe = (handler: TypedEventHandler) => dispatcher.subscribe(handler)
    this._unsubscribe = (handler: TypedEventHandler) => dispatcher.unsubscribe(handler)
    this._one = (handler: TypedEventHandler) => dispatcher.one(handler)
    this._has = (handler: TypedEventHandler) => dispatcher.has(handler)
    this._clear = () => dispatcher.clear()
    this._count = () => dispatcher.count
  }

  get count (): number {
    return this._count()
  }

  public subscribe (handler: TypedEventHandler): () => void {
    return this._subscribe(handler)
  }

  public unsubscribe (handler: TypedEventHandler): void {
    this._unsubscribe(handler)
  }

  public one (handler: TypedEventHandler): () => void {
    return this._one(handler)
  }

  public has (handler: TypedEventHandler): boolean {
    return this._has(handler)
  }

  public clear (): void {
    this._clear()
  }
}

interface IPropagationStatus {
  readonly propagationStopped: boolean
}

export type IEvent<TypedEventArgument> = ISubscribable<IEventHandler<TypedEventArgument>>

class BaseEventDispatcher<TypedEventArgument> implements IEvent<TypedEventArgument> {
  private _asEventWrapper?: DispatcherAsEventWrapper<TypedEventHandler>

  protected _subscriptions = new Array<ISubscription<TypedEventHandler>>()

  get count (): number {
    return this._subscriptions.length
  }

  subscribe (handler: TypedEventHandler): () => void {
    if (typeof handler !== 'undefined') {
      this._subscriptions.push(this.createSubscription(handler, false))
    }
    return () => {
      this.unsubscribe(handler)
    }
  }

  one (handler: TypedEventHandler): () => void {
    if (typeof handler !== 'undefined') {
      this._subscriptions.push(this.createSubscription(handler, true))
    }
    return () => {
      this.unsubscribe(handler)
    }
  }

  has (handler: TypedEventHandler): boolean {
    if (typeof handler === 'undefined') {
      return false
    }
    return this._subscriptions.some((subscription) => subscription.handler === handler)
  }

  unsubscribe (handler: TypedEventHandler): void {
    if (typeof handler === 'undefined') {
      return
    }

    for (let i = 0; i < this._subscriptions.length; i++) {
      if (this._subscriptions[i].handler === handler) {
        this._subscriptions.splice(i, 1)
        break
      }
    }
  }

  protected _dispatch (executeAsync: boolean, scope: any, argument: any): IPropagationStatus | null {
    for (const subscription of [...this._subscriptions]) {
      const eventManager = new EventManagement(() => this.unsubscribe(subscription.handler))

      const typedSubscription = subscription as Subscription<TypedEventHandler>
      typedSubscription.execute(executeAsync, scope, argument, eventManager)
      this.cleanup(typedSubscription)

      if (!executeAsync && eventManager.propagationStopped) {
        return { propagationStopped: true }
      }
    }

    if (executeAsync) {
      return null
    }

    return { propagationStopped: false }
  }

  protected createSubscription (handler: TypedEventHandler, isOnce: boolean): ISubscription<TypedEventHandler> {
    return new Subscription<TypedEventHandler>(handler, isOnce)
  }

  protected cleanup (subscription: ISubscription<TypedEventHandler>) {
    if (subscription.isOnce && subscription.isExecuted) {
      const i = this._subscriptions.indexOf(subscription)
      if (i > -1) {
        this._subscriptions.splice(i, 1)
      }
    }
  }

  clear (): void {
    if (this._subscriptions.length !== 0) {
      this._subscriptions.splice(0, this._subscriptions.length)
    }
  }

  dispatch (argument: TypedEventArgument): IPropagationStatus {
    const result = this._dispatch(false, this, argument)
    if (result === null) {
      throw new DispatchError('Received null in dispatch')
    }
    return result
  }

  dispatchAsync (argument: TypedEventArgument): void {
    this._dispatch(true, this, argument)
  }

  public asEvent (): IEvent<TypedEventArgument> {
    if (typeof this._asEventWrapper === 'undefined') {
      this._asEventWrapper = new DispatcherAsEventWrapper<TypedEventHandler>(this)
    }

    return this._asEventWrapper
  }
}

export class EventDispatcher<TypedEventArgument> extends BaseEventDispatcher<TypedEventArgument> {
  private readonly _onSubscriptionCountChangeEvent = new BaseEventDispatcher<{ count: number}>()

  get onSubscriptionCountChangeEvent () {
    return this._onSubscriptionCountChangeEvent.asEvent()
  }

  subscribe (handler: TypedEventHandler): () => void {
    if (typeof handler !== 'undefined') {
      this._subscriptions.push(this.createSubscription(handler, false))
      this._onSubscriptionCountChangeEvent.dispatch({ count: this.count })
    }
    return () => {
      this.unsubscribe(handler)
    }
  }

  one (handler: TypedEventHandler): () => void {
    if (typeof handler !== 'undefined') {
      this._subscriptions.push(this.createSubscription(handler, true))
      this._onSubscriptionCountChangeEvent.dispatch({ count: this.count })
    }
    return () => {
      this.unsubscribe(handler)
    }
  }

  unsubscribe (handler: TypedEventHandler): void {
    if (typeof handler === 'undefined') {
      return
    }

    for (let i = 0; i < this._subscriptions.length; i++) {
      if (this._subscriptions[i].handler === handler) {
        this._subscriptions.splice(i, 1)
        break
      }
    }
    this._onSubscriptionCountChangeEvent.dispatch({ count: this.count })
  }

  clear (): void {
    if (this._subscriptions.length !== 0) {
      this._subscriptions.splice(0, this._subscriptions.length)
      this._onSubscriptionCountChangeEvent.dispatch({ count: this.count })
    }
  }
}
