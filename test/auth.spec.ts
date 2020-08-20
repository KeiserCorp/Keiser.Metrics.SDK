import { expect } from 'chai'
import Metrics from '../src'
import { BlacklistTokenError, DuplicateEntityError, InvalidCredentialsError, UnauthorizedTokenError } from '../src/error'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

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
    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })

    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can authenticate without refresh token', async function () {
    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: false })

    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can catch authenticate error using basic credentials', async function () {
    let session
    let extError

    try {
      session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: 'wrongPassword' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(InvalidCredentialsError.code)
    expect(session).to.not.be.an('object')
  })

  it('can authenticate using token', async function () {
    const credentialSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
    const refreshToken = credentialSession.refreshToken ?? ''
    credentialSession.close()

    const tokenSession = await metricsInstance.authenticateWithToken({ token: refreshToken })

    expect(tokenSession).to.be.an('object')
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    tokenSession.close()
  })

  it('can authenticate using Google', async function () {
    const redirectUrl = await metricsInstance.authenticateWithGoogle({ redirect: 'localhost:8080' })
    expect(redirectUrl).to.be.a('string')
  })

  it('can authenticate using Facebook', async function () {
    const redirectUrl = await metricsInstance.authenticateWithFacebook({ redirect: 'localhost:8080' })
    expect(redirectUrl).to.be.a('string')
  })

  it('can create a new user with basic authentication', async function () {
    const emailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const session = await metricsInstance.createUser({ email: emailAddress, password: DemoPassword })

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
      session = await metricsInstance.createUser({ email: DemoEmail, password: 'wrongPassword' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(DuplicateEntityError.code)
    expect(session).to.not.be.an('object')
  })

  it('does keep access token alive', async function () {
    this.timeout(accessTokenTimeout + 1000)

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: false })
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

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
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
    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    expect(session).to.be.an('object')

    await session.user.reload()
    session.close()
  })

  it('cannot make model request after close', async function () {
    let extError

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
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

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
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

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
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

  it('can request password reset', async function () {
    await metricsInstance.passwordReset({ email: DemoEmail })
  })
})
