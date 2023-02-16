import Axios, { AxiosError } from 'axios'
import { BrokenCircuitError, BulkheadRejectedError, ConsecutiveBreaker, Policy } from 'cockatiel'

import { DEFAULT_REQUEST_TIMEOUT, DEFAULT_REST_ENDPOINT, DEFAULT_SOCKET_ENDPOINT } from './constants'
import { ActionErrorProperties, ConnectionFaultError, GetErrorInstance, RequestError, SessionError } from './error'
import { EventDispatcher } from './lib/event'

/** @ignore */
const PING_REGEX = /^primus::ping::(\d{13})$/
/** @ignore */
const ERROR_FILTER = (error: any) => typeof error.error === 'undefined' || error.error?.code === 0

export interface ErrorResponse {
  error: {
    code: number
    explanation: string
    message: string
    name: string
    status: number
  }
}

export interface ConnectionOptions {
  restEndpoint?: string
  socketEndpoint?: string
  persistConnection?: boolean
  requestTimeout?: number
}

export interface ConnectionEvent {
  socketConnection: boolean
}

export interface PushDataEvent {
  context: string
  from: number
  message: any
  room: string
  sentAt: number
}

interface SocketResponseMessage {
  context: 'response'
  messageId?: number
  error?: any
}

interface SocketPushMessage {
  context: 'user'
  from: number
  message: any
  room: string
  sentAt: number
}

export class MetricsConnection {
  private readonly _restEndpoint: string
  private readonly _socketEndpoint: string
  private _persistConnection: boolean
  private readonly _requestTimeout: number
  private _socket: WebSocket | null = null
  private _lastMessageId = 0
  private _checkCallbacksTimeoutInstance: NodeJS.Timeout | null = null
  private _socketRetryAttempts: number = 0
  private readonly _callbacks: Map<number, { expiresAt: number | null, callback: (success: any, fail?: any) => void }> = new Map()
  private readonly _socketBulkhead = Policy.bulkhead(5, 25)
  private readonly _retryStrategy = Policy.wrap(
    Policy.handleWhen(ERROR_FILTER).retry().delay([125, 1000, 5000]),
    Policy.handleWhen(ERROR_FILTER).circuitBreaker(15000, new ConsecutiveBreaker(10))
  )

  private readonly _onDisposeEvent = new EventDispatcher<void>()
  private readonly _onConnectionChangeEvent = new EventDispatcher<ConnectionEvent>()
  private readonly _onPushDataEvent = new EventDispatcher<PushDataEvent>()

  constructor (options: ConnectionOptions) {
    this._restEndpoint = options.restEndpoint ?? DEFAULT_REST_ENDPOINT
    this._socketEndpoint = options.socketEndpoint ?? DEFAULT_SOCKET_ENDPOINT
    this._persistConnection = !(options.persistConnection === false)
    this._requestTimeout = options.requestTimeout ?? DEFAULT_REQUEST_TIMEOUT

    if (typeof WebSocket === 'undefined') {
      this._persistConnection = false
    }
    void this.openConnection()
  }

  get onDisposeEvent () {
    return this._onDisposeEvent.asEvent()
  }

  dispose () {
    this._persistConnection = false
    this._onDisposeEvent.dispatchAsync()
    this.closeConnection()
  }

  get socketConnected () {
    return this._socket !== null && this._socket.readyState === WebSocket.OPEN
  }

  get persistConnection () {
    return this._persistConnection
  }

  get onConnectionChangeEvent () {
    return this._onConnectionChangeEvent.asEvent()
  }

  get onPushDataEvent () {
    return this._onPushDataEvent.asEvent()
  }

  get baseUrl () {
    return new URL(this._restEndpoint)
  }

  private async openConnection () {
    if (this._persistConnection) {
      this.checkCallbacks()

      this._socket = new WebSocket(this._socketEndpoint)
      this._socket.onopen = () => this.onSocketOpened()
      this._socket.onclose = () => this.onSocketClosed()
      this._socket.onmessage = (m) => this.onSocketMessage(m)
    }
  }

  private onSocketOpened () {
    this._socketRetryAttempts = 0
    this.dispatchConnectionChange()
  }

  private onSocketClosed () {
    this._socket = null
    this.dispatchConnectionChange()

    const retryTimeout = this._socketRetryAttempts++ < 3 ? 0 : (this._socketRetryAttempts < 24 ? 2000 : 30000)
    setTimeout(() => void this.openConnection(), retryTimeout)
  }

  private closeConnection () {
    this._socket?.close()
    this.checkCallbacks(true)
  }

  private dispatchConnectionChange () {
    this._onConnectionChangeEvent.dispatchAsync({
      socketConnection: this.socketConnected
    })
  }

  private onSocketMessage (messageEvent: MessageEvent) {
    try {
      const data = JSON.parse(messageEvent.data) as SocketResponseMessage | SocketPushMessage | string
      if (typeof data === 'string') {
        if (PING_REGEX.test(data)) {
          const pingResults = PING_REGEX.exec(data)
          if (pingResults !== null) {
            this.pong(pingResults[1])
          }
        } else if (data === 'primus::server::close') {
          this._socket?.close()
        }
      } else if (data.context === 'response') {
        this.parseResponse(data)
      } else if (data.context === 'user') {
        this.parseMessage(data)
      }
    } catch (error) {
      console.error('Unparsable Response', error)
    }
  }

  async action (action: string, params: Object = { }) {
    try {
      const result = await this._retryStrategy.execute(async () => {
        return await new Promise((resolve, reject) => {
          const callback = (success: any, fail?: any) => typeof fail !== 'undefined' ? reject(fail) : resolve(success)
          if (this.socketConnected) {
            void this.actionSocket(action, params, callback)
          } else {
            void this.actionRest(action, params, callback)
          }
        })
      })

      if (result instanceof Error) {
        throw result
      }

      return result
    } catch (error) {
      if (error instanceof BrokenCircuitError) {
        throw new ConnectionFaultError()
      }
      throw error
    }
  }

  private checkCallbacks (clear: boolean = false) {
    if (this._checkCallbacksTimeoutInstance !== null) {
      clearTimeout(this._checkCallbacksTimeoutInstance)
    }
    const now = Date.now()

    this._callbacks.forEach((callback, key) => {
      if (clear || (callback.expiresAt !== null && callback.expiresAt <= now)) {
        try {
          callback.callback(null, { error: { statusText: 'Request timed out.' } })
        } finally {
          this._callbacks.delete(key)
        }
      }
    })

    if (!clear) {
      this._checkCallbacksTimeoutInstance = setTimeout(() => this.checkCallbacks(), 100)
    }
  }

  private pong (time: string) {
    this._socket?.send(`"primus::pong::${time}"`)
  }

  private parseResponse (data: { context: 'response', messageId?: number, error?: any }) {
    if (typeof data.messageId !== 'undefined' && this._callbacks.has(data.messageId)) {
      if (typeof data.error !== 'undefined') {
        const errorInstance = GetErrorInstance(data.error as ActionErrorProperties)
        if (errorInstance instanceof RequestError || errorInstance instanceof SessionError) {
          this._callbacks.get(data.messageId)?.callback(errorInstance)
        } else {
          this._callbacks.get(data.messageId)?.callback(null, errorInstance)
        }
      } else {
        this._callbacks.get(data.messageId)?.callback(data)
      }
      this._callbacks.delete(data.messageId)
    }
  }

  private parseMessage (data: {context: 'user', message: any, room: string, from: number, sentAt: number}) {
    this._onPushDataEvent.dispatchAsync(data as PushDataEvent)
  }

  private async actionSocket (action: string, params: Object, callback: (success: any, fail?: any) => void) {
    try {
      await this._socketBulkhead.execute(async () => await new Promise<void>(resolve => {
        this._lastMessageId++
        const args = {
          messageId: this._lastMessageId,
          event: 'action',
          params: { action, ...params }
        }

        this._callbacks.set(this._lastMessageId, {
          callback: (success: any, fail?: any) => {
            callback(success, fail)
            resolve()
          },
          expiresAt: Date.now() + this._requestTimeout
        })

        this._socket?.send(JSON.stringify(args))
      }))
    } catch (error) {
      if (error instanceof BulkheadRejectedError) {
        callback(null, { error: { statusText: 'Socket request queue is full.' } })
      } else {
        callback(null, { error })
      }
    }
  }

  private async actionRest (action: string, params: Object, callback: (success: any, fail?: any) => void) {
    try {
      const actionSplit = action.split(':')
      const actionRoute = actionSplit.length > 1 ? actionSplit[0] + actionSplit[1].charAt(0).toUpperCase() + actionSplit[1].slice(1) : actionSplit[0]
      const response = await Axios({
        method: 'POST',
        url: `${this._restEndpoint}/${actionRoute}`,
        data: params,
        timeout: this._requestTimeout
      })
      callback(response.data)
    } catch (error) {
      if (error instanceof Error) {
        const actionError = (error as AxiosError<{error: ActionErrorProperties }>)?.response?.data?.error
        if (typeof actionError !== 'undefined') {
          const errorInstance = GetErrorInstance(actionError)
          if (errorInstance instanceof RequestError || errorInstance instanceof SessionError) {
            callback(errorInstance)
          } else {
            callback(null, errorInstance)
          }
        }
      }
      callback(null, { error })
    }
  }
}
