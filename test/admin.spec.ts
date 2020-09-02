import { expect } from 'chai'
import { MetricsAdmin } from '../src'
import { StatSorting } from '../src/models/stat'
import { User, UserSorting } from '../src/models/user'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

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
    const session = await metricsInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })

    expect(session).to.be.an('object')
    expect(session instanceof AdminSession).to.equal(true)
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can authenticate using token', async function () {
    const credentialSession = await metricsInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
    const refreshToken = credentialSession.refreshToken ?? ''
    credentialSession.close()

    const tokenSession = await metricsInstance.authenticateAdminWithToken({ token: refreshToken })

    expect(tokenSession).to.be.an('object')
    expect(tokenSession instanceof AdminSession).to.equal(true)
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    session = tokenSession
  })

  it('can get stats', async function () {
    const stats = await session.getStats()

    expect(Array.isArray(stats)).to.equal(true)
    expect(stats.meta.sort).to.equal(StatSorting.CreatedAt)
  })

  it('can get users', async function () {
    const users = await session.getUsers()

    expect(Array.isArray(users)).to.equal(true)
    expect(users.length).to.be.above(0)
    expect(users[0] instanceof User).to.equal(true)
    expect(users.meta.sort).to.equal(UserSorting.ID)
  })

  it('can get specific user', async function () {
    const user = await session.getUser({ userId: 1 })

    expect(typeof user).to.equal('object')
    expect(user.id).to.equal(1)
  })

  it('can merge users', async function () {
    const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const newInstance = await metricsInstance.createUser({ email: userEmailAddress, password: DemoPassword })

    const mergedUser = await session.mergeUsers({ fromUserId: newInstance.user.id, toUserId: DemoUserId })
    const emailAddresses = await mergedUser.getEmailAddresses({ limit: 1000 })

    expect(emailAddresses).to.be.an('array')
    expect(emailAddresses.length).to.above(1)
    const addedEmailAddresses = emailAddresses.filter(e => e.email === userEmailAddress)
    expect(addedEmailAddresses.length).to.equal(1)
    await Promise.all(addedEmailAddresses.map(e => e.delete()))
  })

})
