import Axios from 'axios'
import { BrokenCircuitError, ConsecutiveBreaker, Policy } from 'cockatiel'
import { SimpleEventDispatcher } from 'ste-simple-events'

import { DEFAULT_REQUEST_TIMEOUT, DEFAULT_REST_ENDPOINT, DEFAULT_SOCKET_ENDPOINT } from './constants'
import { ActionErrorProperties, ConnectionFaultError, GetErrorInstance, RequestError, SessionError } from './error'

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

export class MetricsConnection {
  private readonly _restEndpoint: string
  private readonly _socketEndpoint: string
  private _persistConnection: boolean
  private readonly _requestTimeout: number
  private _socket: WebSocket | null = null
  private _lastMessageId = 0
  private _checkCallbacksTimeoutInstance: number | null = null
  private _socketRetryAttempts: number = 0
  private readonly _callbacks: Map<number, { expiresAt: number | null, callback: (success: any, fail?: any) => void }> = new Map()
  private readonly _retryStrategy = Policy.wrap(
    Policy.handleWhen(ERROR_FILTER).retry().delay([125, 1000, 5000]),
    Policy.handleWhen(ERROR_FILTER).circuitBreaker(15000, new ConsecutiveBreaker(10))
  )

  private readonly _onDisposeEvent = new SimpleEventDispatcher<void>()
  private readonly _onConnectionChangeEvent = new SimpleEventDispatcher<ConnectionEvent>()

  constructor (options: ConnectionOptions) {
    this._restEndpoint = options.restEndpoint ?? DEFAULT_REST_ENDPOINT
    this._socketEndpoint = options.socketEndpoint ?? DEFAULT_SOCKET_ENDPOINT
    this._persistConnection = !(options.persistConnection === false)
    this._requestTimeout = options.requestTimeout ?? DEFAULT_REQUEST_TIMEOUT

    if (typeof (window as any) === 'undefined' || typeof window.WebSocket === 'undefined') {
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
    this.dispatchConnectionChange()
    this._socket = null

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
      const data = JSON.parse(messageEvent.data) as { context?: string, messageId?: number, error?: any } | string
      if (typeof data === 'string') {
        if (PING_REGEX.test(data)) {
          const pingResults = PING_REGEX.exec(data)
          if (pingResults !== null) {
            this.pong(pingResults[1])
          }
        }
      } else if (data.context === 'response') {
        this.parseResponse(data)
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
            this.actionSocket(action, { apiVersion: 1, ...params }, callback)
          } else {
            void this.actionRest(action, { apiVersion: 1, ...params }, callback)
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
      this._checkCallbacksTimeoutInstance = window.setTimeout(() => this.checkCallbacks(), 100)
    }
  }

  private pong (time: string) {
    this._socket?.send(`"primus::pong::${time}"`)
  }

  private parseResponse (data: { messageId?: number, error?: any }) {
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

  private actionSocket (action: string, params: Object, callback: (success: any, fail?: any) => void) {
    this._lastMessageId++
    const args = {
      messageId: this._lastMessageId,
      event: 'action',
      params: { action, ...params }
    }

    this._callbacks.set(this._lastMessageId, {
      callback,
      expiresAt: Date.now() + this._requestTimeout
    })

    this._socket?.send(JSON.stringify(args))
  }

  private async actionRest (action: string, params: Object, callback: (success: any, fail?: any) => void) {
    try {
      const response = await Axios({
        method: 'POST',
        url: `${this._restEndpoint}?action=${action}`,
        data: params,
        timeout: this._requestTimeout
      })
      callback(response.data)
    } catch (error) {
      if (typeof error?.response?.data !== 'undefined') {
        const errorInstance = GetErrorInstance(error.response.data.error as ActionErrorProperties)
        if (errorInstance instanceof RequestError || errorInstance instanceof SessionError) {
          callback(errorInstance)
        } else {
          callback(null, errorInstance)
        }
      } else {
        callback(null, { error })
      }
    }
  }
}
