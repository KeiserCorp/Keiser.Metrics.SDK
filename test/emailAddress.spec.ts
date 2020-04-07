import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { User } from '../src/models/user'
import { EmailAddress } from '../src/models/emailAddress'

describe('Email Address', function () {
  let metricsInstance: Metrics
  let session: Session
  let user: User
  let emailAddress: EmailAddress
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.createUser(newUserEmail, 'password')
    user = session.user
  })

  after(function () {
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
  })

  it('can delete email address', async function () {
    let extError

    await emailAddress.delete()

    try {
      await emailAddress.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('object')
    expect(extError.error).to.be.an('object')
    expect(extError.error.code).to.equal(605)
  })

})
