import { expect } from 'chai'

import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { StrengthMachineIdentifier } from '../src/models/strengthMachine'
import { FacilityUserSession, StrengthMachineSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { a500SetDataSample, a500TimeSeriesPointsSample } from './samples/a500'

describe('A500', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let machineSession: StrengthMachineSession
  let userSession: FacilityUserSession
  const strengthMachineIdentifier: StrengthMachineIdentifier = {
    machineModel: '1399',
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newUserMemberId = [...Array(6)].map(i => (~~(Math.random() * 10)).toString()).join('')

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

  after(async function () {
    await userSession.user.delete()
    metricsInstance?.dispose()
  })

  it('can register machine with facility', async function () {
    const a500MachineInitializerToken = await facility.getA500MachineInitializerToken()
    machineSession = await metricsInstance.authenticateWithA500MachineInitializerToken({ a500MachineInitializerToken, strengthMachineIdentifier })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can use machine session to login user', async function () {
    const facilityRelationship = await facility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Archie Richards', memberIdentifier: newUserMemberId })
    userSession = await machineSession.userLogin({ memberIdentifier: facilityRelationship.memberIdentifier as string })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(facilityRelationship.userId)
  })

  it('can create A500 utilization instance', async function () {
    await machineSession.createA500UtilizationInstance({ takenAt: new Date(), repetitionCount: 15 })
  })

  it('can create A500 data set', async function () {
    this.timeout(10000)

    const response = await userSession.user.createA500Set({
      strengthMachineSession: machineSession,
      setData: a500SetDataSample,
      sampleData: a500TimeSeriesPointsSample
    })
    expect(typeof response).to.not.equal('undefined')
    expect(response.id).to.not.equal(0)
  })
})
