import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword, DemoUserId } from './constants'
import { MetricsAdmin } from '../src'
import { AdminSession } from '../src/session'
import { User } from '../src/models/user'

describe('Admin', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can authenticate admin using basic credentials', async function () {
    const session = await metricsInstance.authenticateAdminWithCredentials(DemoEmail, DemoPassword, '123456')

    expect(session).to.be.an('object')
    expect(session instanceof AdminSession).to.equal(true)
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can authenticate using token', async function () {
    const credentialSession = await metricsInstance.authenticateAdminWithCredentials(DemoEmail, DemoPassword, '123456')
    const refreshToken = credentialSession.refreshToken ?? ''
    credentialSession.close()

    const tokenSession = await metricsInstance.authenticateAdminWithToken(refreshToken)

    expect(tokenSession).to.be.an('object')
    expect(tokenSession instanceof AdminSession).to.equal(true)
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    session = tokenSession
  })

  it('can get stats', async function () {
    const stats = await session.stats.getStats()

    expect(Array.isArray(stats)).to.equal(true)
    expect(stats.length).to.be.above(0)
    expect(typeof stats[0].id).to.equal('number')
  })

  it('can get users', async function () {
    const users = await session.users.getUsers()

    expect(Array.isArray(users)).to.equal(true)
    expect(users.length).to.be.above(0)
    expect(users[0] instanceof User).to.equal(true)
  })

  it('can merge users', async function () {
    const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const newInstance = await metricsInstance.createUser(userEmailAddress, DemoPassword)

    const mergedUser = await session.users.mergeUsers({ fromUserId: newInstance.user.id, toUserId: DemoUserId })

    expect(mergedUser.emailAddresses).to.be.an('array')
    expect(mergedUser.emailAddresses.length).to.above(1)
    expect(mergedUser.emailAddresses.filter(e => e.email === userEmailAddress).length).to.equal(1)
  })

})
