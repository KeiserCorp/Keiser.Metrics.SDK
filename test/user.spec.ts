import { expect } from 'chai'
import Metrics from '../src'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
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
    userSession = await metricsInstance.createUser({ email: userEmailAddress, password: DemoPassword })
    expect(userSession).to.be.an('object')
    expect(userSession.user).to.be.an('object')
    expect(userSession.user.id).to.not.equal(DemoUserId)

    user = userSession.user
  })

  it('can access user profile properties', async function () {
    expect(user.profile).to.be.an('object')
    expect(user.profile.name).to.be.equal(null)
  })

  it('can reload user', async function () {
    await user.reload()

    expect(user.profile).to.be.an('object')
    expect(user.profile.name).to.be.equal(null)
  })

  it('can change user password', async function () {
    const newPassword = 'p@$$\/\/0r|)'
    await user.changePassword(newPassword)

    expect(user.profile).to.be.an('object')
    expect(user.profile.name).to.equal(null)
  })

  it('can delete user', async function () {
    let extError

    await user.delete()

    try {
      await user.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(615)
  })

})
