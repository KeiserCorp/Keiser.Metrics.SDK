export const DEFAULT_REST_ENDPOINT = 'https://metrics-api.keiser.com/api'
export const DEFAULT_SOCKET_ENDPOINT = 'wss://metrics-api.keiser.com/ws'
export const DEFAULT_REQUEST_TIMEOUT = 5000
export const JWT_TTL_LIMIT = 5000

export enum OAuthProviders {
  Google = 'google',
  Facebook = 'facebook'
}

export enum Gender {
  Male = 'm',
  Female = 'f',
  Other = 'o'
}

export enum Units {
  Metric = 'metric',
  Imperial = 'imperial'
}
