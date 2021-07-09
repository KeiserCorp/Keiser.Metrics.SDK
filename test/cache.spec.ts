import { expect } from 'chai'

import { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { AdminSession } from '../src/session'
import { randomCharacterSequence, randomLetterSequence } from './utils/dummy'
import { elevateUserSession, getDemoUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe('Cache', function () {
  const randomKey = 'test:' + randomLetterSequence(26)
  const cacheValue = randomCharacterSequence(50)
  const cacheTimeout = 6000

  let metricsAdminInstance: MetricsAdmin
  let adminSession: AdminSession

  before(async function () {
    metricsAdminInstance = getMetricsAdminInstance()
    const demoUserSession = await getDemoUserSession(metricsAdminInstance)
    adminSession = await elevateUserSession(metricsAdminInstance, demoUserSession)
  })

  after(function () {
    metricsAdminInstance?.dispose()
  })

  it('can create cache key', async function () {
    const cacheKey = await adminSession.createCacheKey({ key: randomKey, value: cacheValue, expireIn: cacheTimeout })

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.getObject()

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(cacheValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can get cache keys', async function () {
    const keys = await adminSession.getCacheKeys()

    expect(Array.isArray(keys)).to.equal(true)
    expect(keys.length).to.be.above(0)
  })

  it('can get filtered cache keys', async function () {
    const keys = await adminSession.getCacheKeys({ filter: randomKey })

    expect(Array.isArray(keys)).to.equal(true)
    expect(keys.length).to.be.equal(1)
  })

  it('can get specific cache key', async function () {
    const cacheKey = await adminSession.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.getObject()

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(cacheValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can update cache key', async function () {
    const newValue = randomCharacterSequence(50)
    const cacheKey = await adminSession.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    const cacheObject = await cacheKey.updateObject({ value: newValue })

    expect(typeof cacheObject).to.equal('object')
    expect(cacheObject.key).to.be.equal(randomKey)
    expect(cacheObject.value).to.be.equal(newValue)
    expect(cacheObject.expireTimestamp.getTime() - Date.now()).to.be.lessThan(cacheTimeout)
  })

  it('can delete cache key', async function () {
    const cacheKey = await adminSession.getCacheKey(randomKey)

    expect(typeof cacheKey).to.equal('object')
    expect(cacheKey.key).to.be.equal(randomKey)

    await cacheKey.deleteObject()

    let extError

    try {
      await adminSession.getCacheKey(randomKey)
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
