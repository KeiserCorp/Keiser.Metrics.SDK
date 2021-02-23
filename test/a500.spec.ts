import { expect } from 'chai'

import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { MachineSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('A500', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let machineSession: MachineSession
  let userSession: UserSession
  const a500Machine = {
    machineModel: 1399,
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newUserMemberId = [...Array(8)].map(i => (~~(Math.random() * 10)).toString()).join('')

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can register machine with facility', async function () {
    const facilityConfiguration = await facility.getA500Qr()
    machineSession = await metricsInstance.authenticateWithA500MachineToken({ ...a500Machine, authorization: facilityConfiguration.accessToken })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can use machine session to login user', async function () {
    const facilityRelationship = await facility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Archie Richards', memberIdentifier: newUserMemberId })
    userSession = await machineSession.userLogin({ memberIdentifier: facilityRelationship.memberIdentifier })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(facilityRelationship.userId)
  })
})
