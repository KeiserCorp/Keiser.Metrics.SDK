import { expect } from 'chai'

import Metrics from '../src'
import { OAuthProviders, OAuthServiceSorting } from '../src/models/oauthService'
import { User } from '../src/models/user'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('OAuth Service', function () {
  let metricsInstance: Metrics
  let user: User

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('has OAuth services on first load', async function () {
    expect(Array.isArray(user.eagerOAuthServices())).to.equal(true)
  })

  it('can get list of OAuth services', async function () {
    const oauthServices = await user.getOAuthServices()

    expect(Array.isArray(oauthServices)).to.equal(true)
    expect(oauthServices.meta.sort).to.equal(OAuthServiceSorting.ID)
  })

  it('can create Facebook OAuth service', async function () {
    const response = await user.initiateOAuthService({ service: OAuthProviders.Facebook, redirect: 'localhost:8080' })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can create Apple OAuth service', async function () {
    const response = await user.initiateOAuthService({ service: OAuthProviders.Apple, redirect: 'localhost:8080' })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can create Google OAuth service', async function () {
    const response = await user.initiateOAuthService({ service: OAuthProviders.Google, redirect: 'localhost:8080' })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can create Strava OAuth service', async function () {
    const response = await user.initiateOAuthService({ service: OAuthProviders.Strava, redirect: 'localhost:8080' })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.be.a('string')
  })

  it('can create Training Peaks OAuth service', async function () {
    const response = await user.initiateOAuthService({ service: OAuthProviders.TrainingPeaks, redirect: 'localhost:8080' })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.be.a('string')
  })
})
