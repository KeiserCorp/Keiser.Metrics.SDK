import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { EmailAddress } from '../src/models/emailAddress'
import { PrimaryEmailAddress } from '../src/models/primaryEmailAddress'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Primary Email Address', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let user: User
  let addedEmailAddress: EmailAddress
  let existingEmailAddressId: number
  let existingPrimaryEmailAddress: PrimaryEmailAddress
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const createUserResponse = await metricsInstance.createUser({ email: newUserEmail, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    const authenticationResponse = await metricsInstance.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: DemoPassword, acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
    userSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })
    user = userSession.user
    addedEmailAddress = await user.createEmailAddress({ email: newEmail })
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
