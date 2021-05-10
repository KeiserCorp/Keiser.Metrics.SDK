import { expect } from 'chai'

import { MetricsAdmin, MetricsSSO } from '../src'
import { StatSorting } from '../src/models/stat'
import { User, UserSorting } from '../src/models/user'
import { AdminSession } from '../src/session'
import { DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser, CreateUser } from './persistent/user'

describe('Admin', function () {
  let metricsInstance: MetricsAdmin
  let ssoInstance: MetricsSSO
  let session: AdminSession

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    ssoInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
    ssoInstance?.dispose()
  })

  it('can authenticate admin using basic credentials', async function () {
    const session = await AdminUser(metricsInstance)

    expect(session).to.be.an('object')
    expect(session instanceof AdminSession).to.equal(true)
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)
    session.close()
  })

  it('can authenticate using token', async function () {
    const credentialSession = await AdminUser(metricsInstance)
    const refreshToken = credentialSession.refreshToken ?? ''
    credentialSession.close()

    const tokenSession = await metricsInstance.authenticateAdminWithToken({ token: refreshToken })

    expect(tokenSession).to.be.an('object')
    expect(tokenSession instanceof AdminSession).to.equal(true)
    expect(tokenSession.user).to.be.an('object')
    expect(tokenSession.user.id).to.equal(DemoUserId)
    session = tokenSession
  })

  it('can elevate to admin using token', async function () {
    const session = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })

    expect(session).to.be.an('object')
    expect(session instanceof AdminSession).to.equal(false)
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.equal(DemoUserId)

    const adminSession = await session.elevateToAdminSession({ token: '123456' })
    expect(adminSession).to.be.an('object')
    expect(adminSession instanceof AdminSession).to.equal(true)
    expect(adminSession.user).to.be.an('object')
    expect(adminSession.user.id).to.equal(DemoUserId)

    session.close()
    adminSession.close()
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
    const newInstance = await CreateUser(ssoInstance, userEmailAddress)

    const mergedUser = await session.mergeUsers({ fromUserId: newInstance.user.id, toUserId: DemoUserId })
    const emailAddresses = await mergedUser.getEmailAddresses({ limit: 1000 })

    expect(emailAddresses).to.be.an('array')
    expect(emailAddresses.length).to.above(1)
    const addedEmailAddresses = emailAddresses.filter(e => e.email === userEmailAddress)
    expect(addedEmailAddresses.length).to.equal(1)
    await Promise.all(addedEmailAddresses.map(async e => await e.delete()))
  })
})
