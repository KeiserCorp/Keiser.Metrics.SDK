import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { GlobalAccessControl, Permission } from '../src/models/globalAccessControl'
import { User } from '../src/models/user'
import { createNewUserSession, elevateUserSession, getDemoUserSession, getMetricsAdminInstance } from './utils/fixtures'

describe('GlobalAccessControl', function () {
  let metricsAdminInstance: MetricsAdmin
  let adminSession: AdminSession
  let user: User

  before(async function () {
    metricsAdminInstance = getMetricsAdminInstance()
    const demoUserSession = await getDemoUserSession(metricsAdminInstance)
    adminSession = await elevateUserSession(metricsAdminInstance, demoUserSession)
    const userSession = await createNewUserSession(metricsAdminInstance)
    user = userSession.user
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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
