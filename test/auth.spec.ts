import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, BlacklistTokenError, UnauthorizedTokenError } from '../src/error'
import { UserSession } from '../src/session'
import { randomCharacterSequence, randomEmailAddress } from './utils/dummy'
import { createNewUserSession, getAuthenticatedUserSession, getMetricsInstance } from './utils/fixtures'

describe('Auth', function () {
  const newUserEmail = randomEmailAddress()
  const newUserPassword = randomCharacterSequence(16)

  const accessTokenTimeout = 6000
  // --------------------------------------------------------------------
  // Note: These tests require the dev server ENV setup as below
  // SESSION_TIMEOUT="6s"
  // SESSION_REFRESH_TIMEOUT="1m"
  // --------------------------------------------------------------------

  let metricsInstance: Metrics
  let newUserSession: UserSession

  before(async function () {
    metricsInstance = getMetricsInstance()
    newUserSession = await createNewUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })
  })

  after(async function () {
    await newUserSession?.user.delete()
    metricsInstance?.dispose()
  })

  it('can generate SSO request url', async function () {
    const requestUrl = await metricsInstance.generateSSORequestUrl({ returnUrl: 'http://test.keiser.com/app' })

    expect(requestUrl.toString()).to.be.a('string')
    expect(requestUrl.toString()).to.equal('http://localhost:4200/sso/?returnUrl=http%3A%2F%2Ftest.keiser.com%2Fapp')
  })

  it('can authenticate using token', async function () {
    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })
    const tokenSession = await metricsInstance.authenticateWithToken({ token: session.refreshToken ?? '' })
    session.close()
    tokenSession.close()

    expect(tokenSession).to.be.an('object')
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(session.user.id)
  })

  it.skip('does keep access token alive', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })

    try {
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
    } finally {
      session.close()
    }
  })

  it.skip('can subscribe to refresh token change', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })
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
    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })

    expect(session).to.be.an('object')

    await session.user.reload()
    session.close()
  })

  it('cannot make model request after close', async function () {
    let extError

    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })
    expect(session).to.be.an('object')
    session.close()

    try {
      await session.user.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    } finally {
      session.close()
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnauthorizedTokenError.code)
  })

  it('cannot make model request after logout', async function () {
    let extError

    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })

    expect(session).to.be.an('object')
    await session.logout()

    try {
      await session.user.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    } finally {
      session.close()
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnauthorizedTokenError.code)
  })

  it('cannot start session after logout', async function () {
    let extError

    const session = await getAuthenticatedUserSession(metricsInstance, { email: newUserEmail, password: newUserPassword })

    const refreshToken = session.refreshToken ?? ''
    await session.logout()

    try {
      await metricsInstance.authenticateWithToken({ token: refreshToken })
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(BlacklistTokenError.code)
  })
})
