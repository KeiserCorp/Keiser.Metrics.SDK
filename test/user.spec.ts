import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User', function () {
  let ssoInstance: MetricsSSO
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User

  before(async function () {
    ssoInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can authenticate user', async function () {
    const authExchangeToken = await ssoInstance.authenticate({ email: DemoEmail, password: DemoPassword, refreshable: false })

    expect(authExchangeToken).to.be.an('object')
    expect(authExchangeToken.exchangeToken).to.be.a('string')

    userSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authExchangeToken.exchangeToken })
    expect(userSession).to.be.an('object')
    expect(userSession.user).to.be.an('object')
    expect(userSession.user.id).to.equal(DemoUserId)

    user = userSession.user
  })

  it('can access user profile properties', async function () {
    const profile = user.eagerProfile()
    expect(profile).to.be.an('object')
    expect(profile.name).to.be.a('string')
  })

  it('can reload user', async function () {
    const profile = (await user.reload()).eagerProfile()

    expect(profile).to.be.an('object')
    expect(profile.name).to.be.a('string')
  })

  it('can change user password', async function () {
    const newPassword = 'p@$$w0r|)'
    await user.changePassword({ password: newPassword })
  })

  // it('can delete user', async function () {
  //   let extError

  //   await user.delete()

  //   try {
  //     await user.reload()
  //   } catch (error) {
  //     extError = error
  //   }

  //   expect(extError).to.be.an('error')
  //   expect(extError.code).to.equal(BlacklistTokenError.code)
  // })
})
