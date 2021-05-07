import { expect } from 'chai'

import { MetricsAdmin, MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { UnknownEntityError } from '../src/error'
import { GlobalAccessControl, Permission } from '../src/models/globalAccessControl'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('GlobalAccessControl', function () {
  let metricsAdminInstance: MetricsAdmin
  let ssoInstance: MetricsSSO
  let adminSession: AdminSession
  let user: User
  const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    ssoInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })

    adminSession = await metricsAdminInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
    const createUserResponse = await ssoInstance.createUser({ email: userEmailAddress, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    const authenticationResponse = await ssoInstance.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: DemoPassword, acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
    user = (await ssoInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })).user
  })

  after(async function () {
    await user.delete()
    metricsAdminInstance?.dispose()
  })

  it('can create global access control', async function () {
    const { globalAccessControl, globalAccessControlSecret } = await adminSession.createGlobalAccessControl({ userId: user.id })
    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
    expect(globalAccessControlSecret).to.be.an('object')
    expect(globalAccessControlSecret.secret).to.be.a('string')
    expect(globalAccessControlSecret.uri).to.be.a('string')
  })

  it('can list global access control', async function () {
    const globalAccessControls = await adminSession.getGlobalAccessControls()
    expect(Array.isArray(globalAccessControls)).to.equal(true)
    expect(globalAccessControls.length).to.be.above(0)
    const globalAccessControl = globalAccessControls[0]
    expect(globalAccessControl.eagerUser() instanceof User).to.be.equal(true)
  })

  it('can show global access control', async function () {
    const fetchUser = await adminSession.getUser({ userId: user.id })
    const globalAccessControl = await fetchUser.getGlobalAccessControl()

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
  })

  it('can get a specific user privileged global access control', async function () {
    const globalAccessControl = await adminSession.getGlobalAccessControl({ userId: user.id })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
    expect(globalAccessControl.userId).to.equal(user.id)
  })

  it('can update a specific user privileged global access control', async function () {
    const globalAccessControl = await adminSession.getGlobalAccessControl({ userId: user.id })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
    await globalAccessControl.update({ userRights: Permission.View })
    expect(globalAccessControl.userRights).to.be.equal(Permission.View)
  })

  it('can delete a specific user privileged global access control', async function () {
    let extError
    const globalAccessControl = await adminSession.getGlobalAccessControl({ userId: user.id })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
    await globalAccessControl.delete()

    try {
      await globalAccessControl.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
