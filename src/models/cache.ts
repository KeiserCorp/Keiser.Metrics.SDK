import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface CacheKeysResponse extends AuthenticatedResponse {
  cacheKeys: string[]
}

export interface CacheObjectResponse extends AuthenticatedResponse {
  cacheObject: CacheObject
}

export interface CacheObject {
  createdAt: number,
  expireTimestamp: number,
  lastReadAt: number,
  key: string,
  value: string
}

export class Cache extends Model {
  async getCacheKeys (options: {filter?: string} = {}) {
    const { cacheKeys } = await this.action('resque:cache:list') as CacheKeysResponse
    return cacheKeys.filter(key => key.startsWith('cache:' + (options?.filter ?? ''))).map(key => new CacheKey(key.replace(/$cache:/, ''), this.sessionHandler))
  }

  async getCacheKey (key: string) {
    const { cacheObject } = await this.action('resque:cache:show', { key }) as CacheObjectResponse
    return new CacheKey(cacheObject.key, this.sessionHandler)
  }

  async createCacheKey (params: {key: string, value: string, expireIn?: number}) {
    const { cacheObject } = await this.action('resque:cache:create', params) as CacheObjectResponse
    return new CacheKey(cacheObject.key, this.sessionHandler)
  }
}

export class CacheKey extends Model {
  private _key: string

  constructor (key: string, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._key = key
  }

  get key () {
    return this._key
  }

  private mutateObject (cacheObject: CacheObject) {
    return {
      ...cacheObject,
      createdAt: new Date(cacheObject.createdAt),
      expireTimestamp: new Date(cacheObject.expireTimestamp),
      lastReadAt: new Date(cacheObject.lastReadAt)
    }
  }

  async getObject () {
    const { cacheObject } = await this.action('resque:cache:show', { key: this.key }) as CacheObjectResponse
    return this.mutateObject(cacheObject)
  }

  async updateObject (params: {value: string, expireIn?: number}) {
    const { cacheObject } = await this.action('resque:cache:update', { ...params, key: this.key }) as CacheObjectResponse
    return this.mutateObject(cacheObject)
  }

  async deleteObject () {
    await this.action('resque:cache:delete', { key: this.key })
  }
}
