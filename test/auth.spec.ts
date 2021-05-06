import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { BlacklistTokenError, UnauthorizedTokenError } from '../src/error'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Auth', function () {
  const accessTokenTimeout = 6000
  // --------------------------------------------------------------------
  // Note: These tests require the dev server ENV setup as below
  // SESSION_TIMEOUT="6s"
  // SESSION_REFRESH_TIMEOUT="1m"
  // --------------------------------------------------------------------

  let ssoInstance: MetricsSSO
  let metricsInstance: Metrics

  before(function () {
    ssoInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can authenticate using token', async function () {
    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: true })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    const tokenSession = await metricsInstance.authenticateWithToken({ token: session.refreshToken })
    session.close()

    expect(tokenSession).to.be.an('object')
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    tokenSession.close()
  })

  it('does keep access token alive', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: true })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    await new Promise<void>((resolve, reject) => {
      const reload = async () => {
        try {
          await session.user.reload()
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      setTimeout(() => void reload(), accessTokenTimeout + 100)
    })

    session.close()
  })

  it('can subscribe to refresh token change', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: true })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    session.keepAlive = false

    const event = await new Promise(resolve => {
      session.onRefreshTokenChangeEvent.one(e => resolve(e))
      setTimeout(() => void session.user.reload(), accessTokenTimeout + 100)
    }) as any

    expect(event).to.be.an('object')
    expect(event.refreshToken).to.be.a('string')

    session.close()
  })

  it('can make model request', async function () {
    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    expect(session).to.be.an('object')

    await session.user.reload()
    session.close()
  })

  it('cannot make model request after close', async function () {
    let extError

    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    expect(session).to.be.an('object')
    session.close()

    try {
      await session.user.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnauthorizedTokenError.code)
  })

  it('cannot make model request after logout', async function () {
    let extError

    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    expect(session).to.be.an('object')
    await session.logout()

    try {
      await session.user.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnauthorizedTokenError.code)
  })

  it('cannot start session after logout', async function () {
    let extError

    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: true })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    const refreshToken = session.refreshToken ?? ''
    await session.logout()

    try {
      await metricsInstance.authenticateWithToken({ token: refreshToken })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(BlacklistTokenError.code)
  })
})
