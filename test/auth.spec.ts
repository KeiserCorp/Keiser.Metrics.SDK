import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { BlacklistTokenError, DuplicateEntityError, UnauthorizedTokenError } from '../src/error'
import { DemoEmail, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser, CreateUser } from './persistent/user'

describe('Auth', function () {
  const accessTokenTimeout = 6000
  // --------------------------------------------------------------------
  // Note: These tests require the dev server ENV setup as below
  // SESSION_TIMEOUT="6s"
  // SESSION_REFRESH_TIMEOUT="1m"
  // --------------------------------------------------------------------

  let metricsInstance: MetricsSSO

  before(function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can authenticate using token', async function () {
    const session = await AuthenticatedUser(metricsInstance, true)
    const tokenSession = await metricsInstance.authenticateWithToken({ token: session.refreshToken })
    session.close()

    expect(tokenSession).to.be.an('object')
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    tokenSession.close()
  })

  it('does keep access token alive', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await AuthenticatedUser(metricsInstance, true)
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

    const session = await AuthenticatedUser(metricsInstance, true)
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
    const session = await AuthenticatedUser(metricsInstance)

    expect(session).to.be.an('object')

    await session.user.reload()
    session.close()
  })

  it('cannot make model request after close', async function () {
    let extError

    const session = await AuthenticatedUser(metricsInstance)
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

    const session = await AuthenticatedUser(metricsInstance)

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

    const session = await AuthenticatedUser(metricsInstance, true)

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

  it('can create a new user with basic authentication', async function () {
    const emailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const session = await CreateUser(metricsInstance, emailAddress)

    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.not.equal(DemoUserId)
    await session.user.delete()
    session.close()
  })

  it('can catch error when creating new user (duplicate user)', async function () {
    let session
    let extError

    try {
      session = await CreateUser(metricsInstance, DemoEmail)
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(DuplicateEntityError.code)
    expect(session).to.not.be.an('object')
  })
})
