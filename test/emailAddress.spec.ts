import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { UnknownEntityError } from '../src/error'
import { EmailAddress } from '../src/models/emailAddress'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Email Address', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let user: User
  let emailAddress: EmailAddress
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const createUserResponse = await metricsInstance.createUser({ email: newUserEmail, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    const authenticationResponse = await metricsInstance.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: 'password', acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
    userSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })
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
