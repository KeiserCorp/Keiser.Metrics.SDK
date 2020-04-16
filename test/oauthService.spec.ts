import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { User, OAuthProviders } from '../src/models/user'

describe('OAuth Service', function () {
  let metricsInstance: Metrics
  let session: Session
  let user: User

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    user = session.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('has OAuth services on first load', async function () {
    expect(Array.isArray(user.oauthServices)).to.equal(true)
  })

  it('can get list of OAuth services', async function () {
    const oauthServices = await user.getOAuthServices()

    expect(Array.isArray(oauthServices)).to.equal(true)
  })

  it('can create Facebook OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Facebook , redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Google OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Google , redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Strava OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.Strava , redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

  it('can create Training Peaks OAuth service', async function () {
    const oauthServiceUrl = await user.createOAuthService({ service: OAuthProviders.TrainingPeaks , redirect: 'localhost:8080' })

    expect(typeof oauthServiceUrl).to.equal('string')
  })

})
