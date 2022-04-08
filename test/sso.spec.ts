import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, InvalidCredentialsError } from '../src/error'
import MetricsSSO from '../src/sso'
import { DemoEmail, DemoPassword, DemoUserId } from './utils/constants'
import { randomEmailAddress } from './utils/dummy'
import { getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('SSO', function () {
  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO

  before(function () {
    metricsInstance = getMetricsInstance()
    metricsSSOInstance = getMetricsSSOInstance()
  })

  after(function () {
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
  })

  it('can authenticate using basic credentials', async function () {
    const userSession = await metricsSSOInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    expect(userSession).to.be.an('object')
    expect(userSession.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: userSession.exchangeToken })
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
  })

  it('can authenticate using existing token', async function () {
    const userSession = await metricsSSOInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: true })
    expect(userSession).to.be.an('object')

    if (userSession.refreshToken === null) {
      throw new Error('Missing Refresh Token')
    }

    const exchangeableUserSession = await metricsSSOInstance.authenticateWithToken({ token: userSession.refreshToken })
    expect(exchangeableUserSession).to.be.an('object')
    expect(exchangeableUserSession.exchangeToken).to.be.a('string')
  })

  it('can authenticate with exchange token', async function () {
    const userSession = await metricsSSOInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword, refreshable: false })
    expect(userSession).to.be.an('object')
    expect(userSession.exchangeToken).to.be.a('string')

    const session = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: userSession.exchangeToken })
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
  })

  it('can catch authenticate error using basic credentials', async function () {
    let session
    let extError

    try {
      session = await metricsSSOInstance.authenticateWithCredentials({ email: DemoEmail, password: 'wrongPassword' })
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(InvalidCredentialsError.code)
    expect(session).to.not.be.an('object')
  })

  it('can authenticate using Google', async function () {
    const response = await metricsSSOInstance.initiateOAuthWithGoogle({ redirect: 'localhost:8080' })
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can authenticate using Facebook', async function () {
    const response = await metricsSSOInstance.initiateOAuthWithFacebook({ redirect: 'localhost:8080' })
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can authenticate using Apple', async function () {
    const response = await metricsSSOInstance.initiateOAuthWithApple({ redirect: 'localhost:8080' })
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can request a new user account', async function () {
    const emailAddress = randomEmailAddress()
    const response = await metricsSSOInstance.initializeUserCreation({ email: emailAddress, returnUrl: 'http://localhost:4200/sso' })
    expect(response).to.be.equal(undefined)
  })

  it('can request password reset', async function () {
    await metricsSSOInstance.initiatePasswordReset({ email: DemoEmail, returnUrl: 'http://localhost:4200/sso' })
  })
})
