import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { BlacklistTokenError } from '../src/error'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User', function () {
  let ssoInstance: MetricsSSO
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

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

  it('can create new user', async function () {
    const createUserResponse = await ssoInstance.createUser({ email: userEmailAddress, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    const authenticationResponse = await ssoInstance.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: 'password', acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
    userSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })
    expect(userSession).to.be.an('object')
    expect(userSession.user).to.be.an('object')
    expect(userSession.user.id).to.not.equal(DemoUserId)

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

  it('can delete user', async function () {
    let extError

    await user.delete()

    try {
      await user.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(BlacklistTokenError.code)
  })
})
