export const DEFAULT_REST_ENDPOINT = 'https://metrics-api.keiser.com/api'
export const DEFAULT_SOCKET_ENDPOINT = 'wss://metrics-api.keiser.com/ws'
export const DEFAULT_REQUEST_TIMEOUT = 5000
export const JWT_TTL_LIMIT = 5000

export enum Units {
  Metric = 'metric',
  Imperial = 'imperial'
}

export enum Side {
  Left = 'left',
  Right = 'right'
}

export enum TestSide {
  Left = 'left',
  Right = 'right',
  Both = 'both'
}

export enum ForceUnit {
  Pounds = 'lb',
  Kilograms = 'kg',
  Newtons = 'ne',
  Unknown = 'er'
}
