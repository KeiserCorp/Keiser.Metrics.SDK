import { expect } from 'chai'

import Metrics from '../src/core'
import { Application } from '../src/models/application'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { oAuthGrantTypes, oAuthResponseTypes } from '../src/models/oauthService'
import { User } from '../src/models/user'
import { UserApplicationAuthorizationSorting } from '../src/models/userApplicationAuthorization'
import { createNewUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe('User Application Authorization', function () {
  this.timeout(100000)
  let metricsInstance: Metrics
  let user: User
  let createdApplication: Application
  let createdDevelopmentAccount: DevelopmentAccount
  let authorizationCode: string

  before(async function () {
    metricsInstance = getMetricsAdminInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user

    const developmentAccount = await user.createDevelopmentAccount({
      company: 'Keiser',
      address: '2470 S Cherry Ave, Fresno, CA 93706',
      websiteUrl: 'www.keiser.com',
      privacyUrl: 'www.keiser.com/privacy',
      termsUrl: 'www.keiser.com/terms'
    })

    const application = await developmentAccount.createApplication({
      applicationName: 'Metrics',
      redirectUrl: 'https://metrics.keiser.com'
    })

    createdApplication = application
    createdDevelopmentAccount = developmentAccount
  })

  after(async function () {
    await createdApplication.delete()
    await createdDevelopmentAccount.delete()
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can authorize a user for an application', async function () {
    const response = await user.authorize({
      clientIdentifier: createdApplication.clientId,
      redirectUrl: createdApplication.redirectUrl,
      responseType: oAuthResponseTypes.Code,
      state: 'test'
    })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.not.equal(null)

    authorizationCode = (new URLSearchParams(response.redirectUrl).get('authorization_code'))
  })

  it('can call token endpoint for oauth token', async function () {
    const credentials = await metricsInstance.token({
      clientIdentifier: createdApplication.clientId,
      clientSecret: createdApplication.clientSecret,
      authorizationCode: authorizationCode,
      grantType: oAuthGrantTypes.AuthorizationCode
    })

    expect(credentials).to.be.an('object')
    expect(credentials.accessToken).to.not.equal(null)
    expect(credentials.refreshToken).to.not.equal(null)
    expect(credentials.expiresIn).to.not.equal(null)
  })

  it('can list user application authorizations as a user', async function () {
    const userApplicationAuthorizations = await user.getUserApplicationAuthorizations({
      userId: user.id
    })

    expect(Array.isArray(userApplicationAuthorizations)).to.equal(true)
    expect(userApplicationAuthorizations.length).to.be.above(0)
    expect(userApplicationAuthorizations.meta.sort).to.be.equal(UserApplicationAuthorizationSorting.ID)
    expect(userApplicationAuthorizations[0].applicationId).to.equal(createdApplication.id)
    expect(userApplicationAuthorizations[0].userId).to.equal(user.id)
  })
})
