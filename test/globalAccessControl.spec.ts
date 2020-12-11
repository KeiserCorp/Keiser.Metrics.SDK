import { expect } from 'chai'

import { MetricsAdmin } from '../src'
import { GlobalAccessControl, PrivilegedGlobalAccessControl, Permission } from '../src/models/globalAccessControl'
import { User } from '../src/models/user'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DemoUserId, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { UnknownEntityError } from '../src/error'

describe('GlobalAccessControl', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession
  let userId: number

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

  it('can create global access control', async function () {
    const adminSession = await metricsInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })

    expect(adminSession).to.be.an('object')
    expect(adminSession instanceof AdminSession).to.equal(true)
    expect(adminSession.user).to.be.an('object')
    expect(adminSession.user.id).to.equal(DemoUserId)
    session = adminSession

    const userEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
    const newInstance = await metricsInstance.createUser({ email: userEmailAddress, password: DemoPassword })

    const globalAccessControl = await session.createUserGlobalAccessControl({ userId: newInstance.user.id })
    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof PrivilegedGlobalAccessControl).to.be.equal(true)
    expect(globalAccessControl.secret).to.be.an('string')

    userId = newInstance.user.id
  })

  it('can show global access control', async function () {
    const user = await session.getUser({ userId })
    const globalAccessControl = await user.getGlobalAccessControl()

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof GlobalAccessControl).to.be.equal(true)
  })

  it('can get a specific user privileged global access control', async function () {
    const globalAccessControl = await session.getUserGlobalAccessControl({ userId })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof PrivilegedGlobalAccessControl).to.be.equal(true)
  })

  it('can update a specific user privileged global access control', async function () {
    const globalAccessControl = await session.getUserGlobalAccessControl({ userId })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof PrivilegedGlobalAccessControl).to.be.equal(true)
    await globalAccessControl.update({ userRights: Permission.View})
    expect(globalAccessControl.userRights).to.be.equal(Permission.View)
  })

  it('can delete a specific user privileged global access control', async function () {
    let extError
    const globalAccessControl = await session.getUserGlobalAccessControl({ userId })

    expect(globalAccessControl).to.be.an('object')
    expect(globalAccessControl instanceof PrivilegedGlobalAccessControl).to.be.equal(true)
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
