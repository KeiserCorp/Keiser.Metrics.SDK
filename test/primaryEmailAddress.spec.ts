import { expect } from 'chai'

import Metrics from '../src/core'
import { EmailAddress } from '../src/models/emailAddress'
import { PrimaryEmailAddress } from '../src/models/primaryEmailAddress'
import { User } from '../src/models/user'
import { randomEmailAddress } from './utils/dummy'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Primary Email Address', function () {
  let metricsInstance: Metrics
  let user: User
  let addedEmailAddress: EmailAddress
  let existingEmailAddressId: number
  let existingPrimaryEmailAddress: PrimaryEmailAddress

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
    addedEmailAddress = await user.createEmailAddress({ email: randomEmailAddress() })
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can get static primary email address', async function () {
    const primaryEmailAddress = user.eagerPrimaryEmailAddress() as PrimaryEmailAddress

    expect(primaryEmailAddress).to.be.an('object')
    expect(primaryEmailAddress.emailAddressId).to.be.a('number')
    existingEmailAddressId = primaryEmailAddress.emailAddressId
  })

  it('can get dynamic primary email address', async function () {
    const primaryEmailAddress = await user.getPrimaryEmailAddress()

    expect(primaryEmailAddress).to.be.an('object')
    expect(primaryEmailAddress.emailAddressId).to.be.a('number')
    expect(primaryEmailAddress.emailAddressId).to.equal(existingEmailAddressId)
    existingPrimaryEmailAddress = primaryEmailAddress
  })

  it('can reload primary email address', async function () {
    await existingPrimaryEmailAddress.reload()

    expect(existingPrimaryEmailAddress).to.be.an('object')
    expect(existingPrimaryEmailAddress.emailAddressId).to.equal(existingEmailAddressId)
  })

  it('can get updated primary email addresses', async function () {
    await existingPrimaryEmailAddress.update({ emailAddressId: addedEmailAddress.id })

    expect(existingPrimaryEmailAddress.emailAddressId).to.not.equal(existingEmailAddressId)
    expect(existingPrimaryEmailAddress.emailAddressId).to.equal(addedEmailAddress.id)
  })

  it('can get email addresses marked as primary', async function () {
    const emailAddress = await existingPrimaryEmailAddress.getEmailAddress()

    expect(emailAddress).to.be.an('object')
    expect(emailAddress.id).to.be.a('number')
    expect(emailAddress.id).to.equal(addedEmailAddress.id)
    expect(emailAddress.email).to.equal(addedEmailAddress.email)
  })
})
