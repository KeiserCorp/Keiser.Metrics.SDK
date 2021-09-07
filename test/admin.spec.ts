import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { StatSorting } from '../src/models/stat'
import { User, UserSorting } from '../src/models/user'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { createNewUserSession, getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Admin', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let demoUserSession: UserSession
  let adminSession: AdminSession

  before(async function () {
    metricsInstance = getMetricsInstance()
    demoUserSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
  })

  after(function () {
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can elevate to admin using token', async function () {
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(demoUserSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    expect(adminSession).to.be.an('object')
    expect(adminSession instanceof AdminSession).to.equal(true)
    expect(adminSession.user).to.be.an('object')
    expect(adminSession.user.id).to.equal(demoUserSession.user.id)
  })

  it('can get stats', async function () {
    const stats = await adminSession.getStats()

    expect(Array.isArray(stats)).to.equal(true)
    expect(stats.meta.sort).to.equal(StatSorting.CreatedAt)
  })

  it('can get users', async function () {
    const users = await adminSession.getUsers()

    expect(Array.isArray(users)).to.equal(true)
    expect(users.length).to.be.above(0)
    expect(users[0] instanceof User).to.equal(true)
    expect(users.meta.sort).to.equal(UserSorting.ID)
  })

  it('can get specific user', async function () {
    const user = await adminSession.getUser({ userId: 1 })

    expect(typeof user).to.equal('object')
    expect(user.id).to.equal(1)
  })

  it('can merge users', async function () {
    const newUserAlpha = await createNewUserSession(metricsInstance)
    const newUserBeta = await createNewUserSession(metricsInstance)

    const mergedUser = await adminSession.mergeUsers({ fromUserId: newUserAlpha.user.id, toUserId: newUserBeta.user.id })
    const emailAddresses = await mergedUser.getEmailAddresses({ limit: 1000 })

    expect(emailAddresses).to.be.an('array')
    expect(emailAddresses.length).to.equal(2)
    await mergedUser.delete()
  })
})
