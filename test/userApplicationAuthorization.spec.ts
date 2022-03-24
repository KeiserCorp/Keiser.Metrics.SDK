import { expect } from 'chai'

import Metrics from '../src/core'
import { Application } from '../src/models/application'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { oAuthResponseTypes } from '../src/models/oauthService'
import { User } from '../src/models/user'
import { createNewUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe.only('User Application Authorization', function () {
  let metricsInstance: Metrics
  let user: User
  let createdApplication: Application
  let createdDevelopmentAccount: DevelopmentAccount

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
      redirectUrl: 'metrics.keiser.com'
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
    const redirectUrl = await user.authorize({
      clientIdentifier: createdApplication.clientId,
      redirectUrl: createdApplication.redirectUrl,
      responseType: oAuthResponseTypes.Code,
      state: 'test'
    })

    expect(redirectUrl).to.not.be(null)
  })

  it('can get a user application authorization as a user', async function () {
    const userApplicationAuthorization = await user.getUserApplicationAuthorization({ id: 1 })
    expect(userApplicationAuthorization).to.be.an('object')
  })

  // it('can delete a user application authorization as a user', async function () {
  //   let extError

  //   await
  // })
})
