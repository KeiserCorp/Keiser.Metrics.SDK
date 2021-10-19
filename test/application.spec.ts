import { expect } from 'chai'

import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { Application, ApplicationSorting } from '../src/models/application'
import { DevelopmentAccount } from '../src/models/developmentAccount'
import { User } from '../src/models/user'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe.only('Application', function () {
  let metricsInstance: Metrics
  let user: User
  let createdApplication: Application
  let createdDevelopmentAccount: DevelopmentAccount

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user

    const developmentAccount = await user.createDevelopmentAccount({
      company: 'Keiser',
      address: '2470 S Cherry Ave, Fresno, CA 93706',
      websiteUrl: 'www.keiser.com'
    })

    createdDevelopmentAccount = developmentAccount
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can create an Appliction', async function () {
    const application = await createdDevelopmentAccount.createApplication({
      applicationName: 'Test Application',
      redirectUrl: 'www.testapplication.com/redirect'
    })

    expect(application).to.be.an('object')
    expect(application.clientId).to.not.equal(null)
    expect(application.clientSecret).to.not.equal(null)
    expect(application.applicationName).to.be.equal('Test Application')
    expect(application.redirectUrl).to.be.equal('www.testapplication.com/redirect')

    createdApplication = application
  })

  it('can get an Application', async function () {
    const application = await createdDevelopmentAccount.getApplication({
      id: createdApplication.id
    })

    expect(application).to.be.an('object')
    expect(application.clientId).to.not.equal(null)
    expect(application.clientSecret).to.not.equal(null)
    expect(application.applicationName).to.be.equal('Test Application')
    expect(application.redirectUrl).to.be.equal('www.testapplication.com/redirect')
  })

  it('can update an Application', async function () {
    const application = await createdApplication.update({
      applicationName: 'Updated Application',
      redirectUrl: 'www.updatedapplication.com/redirect'
    })

    expect(application.applicationName).to.be.equal('Updated Application')
    expect(application.redirectUrl).to.be.equal('www.updatedapplication.com/redirect')
  })

  it('can reload an Application', async function () {
    expect(createdApplication).to.be.an('object')
    if (typeof createdApplication !== 'undefined') {
      await createdApplication.reload()
      expect(createdApplication.applicationName).to.be.equal('Updated Application')
      expect(createdApplication.redirectUrl).to.be.equal('www.updatedapplication.com/redirect')
    }
  })

  it('can list Applications', async function () {
    const applications = await createdDevelopmentAccount.getApplications({
      sort: ApplicationSorting.ID,
      ascending: true,
      limit: 10,
      offset: 0
    })

    expect(Array.isArray(applications)).to.equal(true)
    expect(applications.length).to.be.above(0)
    expect(applications[0].clientId).to.not.equal(null)
    expect(applications[0].clientSecret).to.not.equal(null)
    expect(applications[0].applicationName).to.be.equal('Updated Application')
    expect(applications[0].redirectUrl).to.be.equal('www.updatedapplication.com/redirect')
  })

  it('can delete an Application', async function () {
    let extError

    await createdApplication.delete()

    try {
      await createdApplication.reload()
    } catch (error: any) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.equal(UnknownEntityError.code)
  })
})
