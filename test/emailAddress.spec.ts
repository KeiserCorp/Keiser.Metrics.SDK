import { expect } from 'chai'

import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { EmailAddress } from '../src/models/emailAddress'
import { User } from '../src/models/user'
import { randomEmailAddress } from './utils/dummy'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Email Address', function () {
  const newEmail = randomEmailAddress()

  let metricsInstance: Metrics
  let user: User
  let emailAddress: EmailAddress

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can add email address', async function () {
    emailAddress = await user.createEmailAddress({ email: newEmail })

    expect(emailAddress).to.be.an('object')
    expect(emailAddress.email).to.equal(newEmail)
  })

  it('can reload email address', async function () {
    await emailAddress.reload()

    expect(emailAddress).to.be.an('object')
    expect(emailAddress.email).to.equal(newEmail)
  })

  it('can get updated email addresses', async function () {
    const emailAddresses = await user.getEmailAddresses()

    expect(emailAddresses).to.be.an('array')
    expect(emailAddresses.length).to.equal(2)
    expect(emailAddresses.meta.totalCount).to.equal(2)
  })

  it('can delete email address', async function () {
    let extError

    await emailAddress.delete()

    try {
      await emailAddress.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
