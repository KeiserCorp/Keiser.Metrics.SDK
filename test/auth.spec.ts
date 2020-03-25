import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword, DemoUserId } from './constants'
import Metrics from '../src'

describe('Auth', function () {
  const accessTokenTimeout = 6000
  // --------------------------------------------------------------------
  // Note: These tests require the dev server ENV setup as below
  // SESSION_TIMEOUT="6s"
  // SESSION_REFRESH_TIMEOUT="1m"
  // --------------------------------------------------------------------

  let metricsInstance: Metrics

  before(function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can authenticate using basic credentials', async function () {
    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)

    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can catch authenticate error using basic credentials', async function () {
    let session
    let extError

    try {
      session = await metricsInstance.authenticateWithCredentials(DemoEmail, 'wrongPassword')
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('object')
    expect(extError.error).to.be.an('object')
    expect(extError.error.code).to.equal(603)
    expect(session).to.not.be.an('object')
  })

  it('does keep access token alive', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword, false)
    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          await session.user.reload()
          resolve()
        } catch (error) {
          reject()
        }
      }, accessTokenTimeout + 100)
    })

    session.close()
  })

  it('can subscribe to refresh token change', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    session.keepAlive = false
    const event = await new Promise(resolve => {
      session.onRefreshTokenChangeEvent.one(e => resolve(e))
      setTimeout(() => session.user.reload(), accessTokenTimeout + 100)
    }) as any

    expect(event).to.be.an('object')
    expect(event.refreshToken).to.be.a('string')

    session.close()
  })

  it('can make model request', async function () {
    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    expect(session).to.be.an('object')
    await session.user.reload()
  })

  it('cannot make model request after close', async function () {
    let extError
    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    expect(session).to.be.an('object')
    session.close()
    try {
      await session.user.reload()
    } catch (error) {
      extError = error
    }
    expect(extError).to.be.an('object')
    expect(extError.error).to.be.an('object')
    expect(extError.error.code).to.equal(613)
  })

})
