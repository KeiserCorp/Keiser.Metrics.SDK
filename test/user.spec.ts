import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoPassword, DemoUserId } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { User } from '../src/models/user'

describe('User', function () {
  let metricsInstance: Metrics
  let session: Session
  let user: User
  const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can create new user', async function () {
    session = await metricsInstance.createUser(userEmailAddress, DemoPassword)
    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.not.equal(DemoUserId)

    user = session.user
  })

  it('can access user email address properties', async function () {
    expect(user.emailAddresses).to.be.an('array')
    expect(user.emailAddresses.length).to.equal(1)
    expect(user.emailAddresses[0].email).to.equal(userEmailAddress)
  })

  it('can reload user', async function () {
    await user.reload()

    expect(user.emailAddresses).to.be.an('array')
    expect(user.emailAddresses.length).to.equal(1)
    expect(user.emailAddresses[0].email).to.equal(userEmailAddress)
  })

  it('can change user password', async function () {
    const newPassword = 'p@$$\/\/0r|)'
    await user.changePassword(newPassword)

    expect(user.emailAddresses).to.be.an('array')
    expect(user.emailAddresses.length).to.equal(1)
    expect(user.emailAddresses[0].email).to.equal(userEmailAddress)
  })

  it('can delete user', async function () {
    let extError

    await user.delete()

    try {
      await user.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('object')
    expect(extError.error).to.be.an('object')
    expect(extError.error.code).to.equal(615)
  })

})
