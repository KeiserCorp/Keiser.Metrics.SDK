export interface ConnectionOptions {
  restEndpoint?: string
  socketEndpoint?: string
  persistConnection?: boolean
  requestTimeout?: number
}

export interface ConnectionEvent {
  socketConnection: boolean
}
