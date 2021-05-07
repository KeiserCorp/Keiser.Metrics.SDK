import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { StrengthMachineIdentifier } from '../src/models/strengthMachine'
import { FacilityUserSession, StrengthMachineSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'
import { a500SetDataSample, a500TimeSeriesDataPointSamples } from './samples/a500'

describe('A500', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let machineSession: StrengthMachineSession
  let userSession: FacilityUserSession
  let a500ResultId: number
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
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await AuthenticatedUser(metricsInstance)
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

  it('can initialize machine session with facility using JWT', async function () {
    const machineInitializerToken = await facility.getFacilityStrengthMachineInitializerJWTToken()
    machineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: machineInitializerToken.initializerToken, strengthMachineIdentifier })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can initialize machine session with facility using OTP', async function () {
    const machineInitializerToken = await facility.getFacilityStrengthMachineInitializerOTPToken()
    machineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: `otp:${machineInitializerToken.initializerToken}`, strengthMachineIdentifier })

    expect(typeof machineSession).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof machineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can create new machine session with access token', async function () {
    const newMachineSession = await metricsInstance.authenticateWithMachineToken({ machineToken: machineSession.accessToken, strengthMachineIdentifier })

    expect(typeof newMachineSession).to.not.equal('undefined')
    expect(typeof newMachineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof newMachineSession.sessionHandler.accessToken).to.equal('string')
    expect(newMachineSession.sessionHandler.accessToken).to.not.equal(machineSession.accessToken)
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
      sampleData: a500TimeSeriesDataPointSamples
    })

    expect(typeof response).to.not.equal('undefined')
    expect(response.id).to.not.equal(0)

    a500ResultId = response.id
  })

  it('can create retrieve a500 data set', async function () {
    this.timeout(10000)
    if (typeof a500ResultId === 'undefined') {
      this.skip()
    }

    const response = await userSession.user.getStrengthMachineDataSet({ id: a500ResultId })

    expect(typeof response).to.not.equal('undefined')
    expect(response.id).to.equal(a500ResultId)

    const a500DataSet = response.eagerA500DataSet()
    expect(a500DataSet).to.not.equal('undefined')

    if (typeof a500DataSet !== 'undefined') {
      expect(a500DataSet.eagerRepDataPoints()).to.not.equal('undefined')
      expect(a500DataSet.eagerTimeSeriesPoints()).to.not.equal('undefined')
      expect(a500DataSet.eagerLeftTestResult()).to.not.equal('undefined')
      expect(a500DataSet.eagerRightTestResult()).to.not.equal('undefined')
    }
  })
})
