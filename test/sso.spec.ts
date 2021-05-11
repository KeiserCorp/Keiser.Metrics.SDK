import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { DuplicateEntityError, InvalidCredentialsError } from '../src/error'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('SSO', function () {
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

  it('can authenticate using basic credentials', async function () {
    const userSession = await metricsInstance.authenticate({ email: DemoEmail, password: DemoPassword })

    expect(userSession).to.be.an('object')
    expect(userSession.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: userSession.exchangeToken })
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can authenticate without refresh token', async function () {
    const userSession = await metricsInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: false })

    expect(userSession).to.be.an('object')
    expect(userSession.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: userSession.exchangeToken })
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can catch authenticate error using basic credentials', async function () {
    let session
    let extError

    try {
      session = await metricsInstance.authenticate({ email: DemoEmail, password: 'wrongPassword' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(InvalidCredentialsError.code)
    expect(session).to.not.be.an('object')
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

  it('can request a new user account', async function () {
    const emailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const createUserResponse = await metricsInstance.createUser({ email: emailAddress, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    expect(createUserResponse.authorizationCode).to.be.a('string')
  })

  it('can catch error when creating new user (duplicate user)', async function () {
    let session
    let extError

    try {
      session = await metricsInstance.createUser({ email: DemoEmail, returnUrl: 'localhost:8080' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(DuplicateEntityError.code)
    expect(session).to.not.be.an('object')
  })

  it('can request password authExchangeToken', async function () {
    await metricsInstance.passwordReset({ email: DemoEmail, returnUrl: 'localhost:8080' })
  })
})
