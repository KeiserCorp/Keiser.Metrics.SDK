import { expect } from 'chai'

import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { Application } from '../src/models/application'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { OAuthGrantTypes, OAuthResponseTypes } from '../src/models/oauthService'
import { User } from '../src/models/user'
import { UserApplicationAuthorizationSorting, UserApplicationAuthorizationUser } from '../src/models/userApplicationAuthorization'
import { createNewUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe.only('User Application Authorization', function () {
  this.timeout(100000)
  let metricsInstance: Metrics
  let user: User
  let createdApplication: Application
  let createdDevelopmentAccount: DevelopmentAccount
  let createdUserApplicationAuthorization: UserApplicationAuthorizationUser
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
    const response = await user.OAuthAuthorize({
      clientIdentifier: createdApplication.clientId,
      redirectUrl: createdApplication.redirectUrl,
      responseType: OAuthResponseTypes.Code,
      state: 'test'
    })

    expect(response).to.be.an('object')
    expect(response.redirectUrl).to.not.equal(null)

    authorizationCode = (new URLSearchParams(response.redirectUrl).get('authorization_code'))
  })

  it('can call token endpoint for oauth token', async function () {
    const credentials = await metricsInstance.getOAuthToken({
      clientIdentifier: createdApplication.clientId,
      clientSecret: createdApplication.clientSecret,
      authorizationCode: authorizationCode,
      grantType: OAuthGrantTypes.AuthorizationCode
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

    createdUserApplicationAuthorization = userApplicationAuthorizations[0]
  })

  it('can list user application authorizations as a developer', async function () {
    const userApplicationAuthorizations = await createdApplication.getUserApplicationAuthorizations({
      ascending: true
    })

    expect(Array.isArray(userApplicationAuthorizations)).to.equal(true)
    expect(userApplicationAuthorizations.length).to.be.above(0)
    expect(userApplicationAuthorizations.meta.sort).to.be.equal(UserApplicationAuthorizationSorting.ID)
    expect(userApplicationAuthorizations[0].applicationId).to.equal(createdApplication.id)
    expect(userApplicationAuthorizations[0].userId).to.equal(user.id)
  })

  it('can show a user application authorization as a user', async function () {
    const userApplicationAuthorization = await user.getUserApplicationAuthorization({
      id: createdUserApplicationAuthorization.id
    })

    expect(userApplicationAuthorization).to.be.an('object')
    expect(userApplicationAuthorization.id).to.not.equal(null)
    expect(userApplicationAuthorization.userId).to.not.equal(null)
    expect(userApplicationAuthorization.applicationId).to.not.equal(null)
  })

  it('can show a user application authorization as a developer', async function () {
    const userApplicationAuthorization = await createdApplication.getUserApplicationAuthorization({
      id: createdUserApplicationAuthorization.id
    })

    expect(userApplicationAuthorization).to.be.an('object')
    expect(userApplicationAuthorization.id).to.not.equal(null)
    expect(userApplicationAuthorization.userId).to.not.equal(null)
    expect(userApplicationAuthorization.applicationId).to.not.equal(null)
  })

  it('can delete a user application authorization', async function () {
    let extError

    await createdUserApplicationAuthorization.delete()

    try {
      await createdUserApplicationAuthorization.reload()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(UnknownEntityError.code)
  })
})
