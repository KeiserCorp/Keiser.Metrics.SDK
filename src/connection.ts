import { SimpleEventDispatcher } from 'ste-simple-events'
import Axios from 'axios'
import { DEFAULT_REST_ENDPOINT, DEFAULT_SOCKET_ENDPOINT, DEFAULT_REQUEST_TIMEOUT } from './constants'
import { ConnectionOptions, ConnectionEvent } from './interfaces'

const PING_REGEX = /^primus::ping::(\d{13})$/

export class MetricsConnection {
  private _restEndpoint: string
  private _socketEndpoint: string
  private _persistConnection: boolean
  private _requestTimeout: number
  private _socket: WebSocket | null = null
  private _lastMessageId = 0
  private _checkCallbacksTimeoutInstance: number | null = null
  private _socketRetryAttempts: number = 0
  private _callbacks: { [key: number]: { expiresAt: number | null, callback: (success: any, fail?: any) => void } } = {}

  private _onConnectionChangeEvent = new SimpleEventDispatcher<ConnectionEvent>()

  constructor (options: ConnectionOptions) {
    this._restEndpoint = options.restEndpoint || DEFAULT_REST_ENDPOINT
    this._socketEndpoint = options.socketEndpoint || DEFAULT_SOCKET_ENDPOINT
    this._persistConnection = !(options.persistConnection === false)
    this._requestTimeout = options.requestTimeout || DEFAULT_REQUEST_TIMEOUT

    if (typeof (window as any) === 'undefined' || !(window as any)?.WebSocket) {
      this._persistConnection = false
    }
    void this.openConnection()
  }

  public dispose () {
    this._persistConnection = false
    this.closeConnection()
  }

  public get socketConnected () {
    return !!this._socket && this._socket.readyState === WebSocket.OPEN
  }

  public get persistConnection () {
    return this._persistConnection
  }

  public get onConnectionChangeEvent () {
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

    let retryTimeout = this._socketRetryAttempts++ < 3 ? 0 : (this._socketRetryAttempts < 24 ? 2000 : 30000)
    setTimeout(() => this.openConnection(), retryTimeout)
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
      const data = JSON.parse(messageEvent.data)
      if (PING_REGEX.test(data)) {
        let pingResults = PING_REGEX.exec(data)
        if (pingResults) {
          this.pong(pingResults[1])
        }
      } else if (data.context && data.context === 'response') {
        this.parseResponse(data)
      }
    } catch (error) {
      console.error('Unparsable Response', error)
    }
  }

  public action (action: string, params: Object = {}) {
    return new Promise((resolve, reject) => {
      const callback = (success: any, fail: any) => fail ? reject(fail) : resolve(success)

      if (this.socketConnected) {
        this.actionSocket(action, params, callback)
      } else {
        void this.actionRest(action, params, callback)
      }
    })
  }

  private checkCallbacks (clear: boolean = false) {
    if (this._checkCallbacksTimeoutInstance) {
      clearTimeout(this._checkCallbacksTimeoutInstance)
    }
    const now = Date.now()

    for (const key in this._callbacks) {
      if (this._callbacks.hasOwnProperty(key)) {
        const cb = this._callbacks[key]
        if (clear || (cb.expiresAt && cb.expiresAt <= now)) {
          try {
            cb.callback(null, { error: { statusText: 'Request timed out.' } })
          } finally {
            delete this._callbacks[key]
          }
        }
      }
    }

    if (!clear) {
      this._checkCallbacksTimeoutInstance = window.setTimeout(this.checkCallbacks, 100)
    }
  }

  private pong (time: string) {
    this._socket?.send(`"primus::pong::${time}"`)
  }

  private parseResponse (data: { messageId?: number, error?: any }) {
    if (data.messageId && this._callbacks[data.messageId]) {
      if (data?.error) {
        this._callbacks[data.messageId].callback(null, { error: data.error })
      } else {
        this._callbacks[data.messageId].callback(data)
      }
      delete this._callbacks[data.messageId]
    }
  }

  private actionSocket (action: string, params: Object, callback: (success: any, fail?: any) => void) {
    this._lastMessageId++
    const args = {
      messageId: this._lastMessageId,
      event: 'action',
      params: { action, ...params }
    }

    this._callbacks[this._lastMessageId] = {
      callback,
      expiresAt: Date.now()
    }

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
      if (error?.response?.data) {
        callback(null, error.response.data)
      } else {
        callback(null, {error: {
          name: error.name,
          message: error.message,
          status: 500,
          code: 0,
          explanation: ''
        }})
      }
    }
  }
}
