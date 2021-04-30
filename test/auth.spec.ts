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
  let code: string
  const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

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

  it('can request authorization code', async function () {
    const redirectUrl = await metricsInstance.sso({ redirectUrl: 'localhost:8080' })
    const queryParams: any = redirectUrl.split('?').map(value => value.split('=')).reduce((acc, current) => {
      acc[current[0]] = current[1]
      return acc
    }, {})
    expect(queryParams.code).to.be.a('string')
    code = queryParams.code
  })

  it('can authenticate using basic credientials (SSO)', async function () {
    const session = await metricsInstance.ssoWithCredentials({ email: DemoEmail, password: DemoPassword, code })

    expect(session).to.be.an('object')
    expect(session.redirectUrl).to.be.a('string')
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

  it('can authenticate using Apple', async function () {
    const redirectUrl = await metricsInstance.authenticateWithApple({ redirect: 'localhost:8080' })
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

    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
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

  it('can request user init email', async function () {
    const redirectUrl = await metricsInstance.sso({ redirectUrl: 'localhost:8080' })
    const queryParams: any = redirectUrl.split('?').map(value => value.split('=')).reduce((acc, current) => {
      acc[current[0]] = current[1]
      return acc
    }, {})
    expect(queryParams.code).to.be.a('string')
    code = queryParams.code
    await metricsInstance.ssoWithNewUser({ email: userEmailAddress, code })
  })

  it('can create new user', async function () {
    const response = await metricsInstance.ssoWithUserFulfillment({ code, password: DemoPassword, acceptedTermsRevision: '2020-01-01', name: 'Fake User', birthday: '1990-01-01', gender: 'm', language: 'en', units: 'imperial', metricHeight: 54, metricWeight: 74 })

    expect(response.redirectUrl).to.be.a('string')
  })
})
