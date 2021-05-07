import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { OAuthProviders, OAuthServiceSorting } from '../src/models/oauthService'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('OAuth Service', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let user: User

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
    user = userSession.user
  })

  after(function () {
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
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Facebook, redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Apple OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Apple, redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Google OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Google, redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Strava OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Strava, redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Training Peaks OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.TrainingPeaks, redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })
})
