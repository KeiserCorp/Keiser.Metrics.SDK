import { expect } from 'chai'
import { MetricsAdmin } from '../src'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Cache', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession
  const randomKey = 'test:' + [...Array(20)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
  const cacheValue = 'this is a test'
  const cacheTimeout = 6000

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can create cache key', async function () {
    const cacheKey = await session.cache.createCacheKey({ key: randomKey, value: cacheValue, expireIn: cacheTimeout })

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.getObject()

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(cacheValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can get cache keys', async function () {
    const keys = await session.cache.getCacheKeys()

    expect(Array.isArray(keys)).to.equal(true)
    expect(keys.length).to.be.above(0)
  })

  it('can get filtered cache keys', async function () {
    const keys = await session.cache.getCacheKeys({ filter: randomKey })

    expect(Array.isArray(keys)).to.equal(true)
    expect(keys.length).to.be.equal(1)
  })

  it('can get specific cache key', async function () {
    const cacheKey = await session.cache.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.getObject()

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(cacheValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can update cache key', async function () {
    const newValue = 'this i a new value'
    const cacheKey = await session.cache.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.updateObject({ value: newValue })

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(newValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can delete cache key', async function () {
    const cacheKey = await session.cache.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    await cacheKey.deleteObject()

    let extError

    try {
      await session.cache.getCacheKey(randomKey)
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(605)
  })

})
