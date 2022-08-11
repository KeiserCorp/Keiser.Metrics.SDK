import axios from 'axios'
import { expect } from 'chai'

import Metrics from '../src/core'
import { decompressKA5FromBuffer } from '../src/lib/compress'
import { PrivilegedFacility } from '../src/models/facility'
import { StrengthMachineIdentifier } from '../src/models/strengthMachine'
import { StrengthMachineDataSetExportFormat } from '../src/models/strengthMachineDataSet'
import { StrengthMachineProfileStats } from '../src/models/strengthMachineProfileStats'
import { FacilityUserSession, StrengthMachineSession } from '../src/session'
import { a500SetDataSample, a500TimeSeriesDataPointSamples } from './samples/a500'
import { randomEmailAddress, randomNumberSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, setActiveEmployeeFacility } from './utils/fixtures'

describe('A500', function () {
  const strengthMachineIdentifier: StrengthMachineIdentifier = {
    machineModel: '1399',
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }
  const newUserEmailAddress = randomEmailAddress()
  const newUserMemberId = randomNumberSequence(6)

  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let strengthMachineSession: StrengthMachineSession
  let facilityUserSession: FacilityUserSession
  let a500ResultId: number
  let strengthMachineId: number
  let createdStrengthMachineProfileStats: StrengthMachineProfileStats

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    privilegedFacility = await setActiveEmployeeFacility(demoUserSession)
  })

  after(async function () {
    await facilityUserSession?.user.delete()
    metricsInstance?.dispose()
  })

  it('can initialize machine session with facility using JWT', async function () {
    const machineInitializerToken = await privilegedFacility.getFacilityStrengthMachineInitializerJWTToken()
    strengthMachineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: machineInitializerToken.initializerToken, strengthMachineIdentifier })

    expect(typeof strengthMachineSession).to.not.equal('undefined')
    expect(typeof strengthMachineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof strengthMachineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can initialize machine session with facility using OTP', async function () {
    const machineInitializerToken = await privilegedFacility.getFacilityStrengthMachineInitializerOTPToken()
    const strengthMachineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: `otp:${machineInitializerToken.initializerToken}`, strengthMachineIdentifier })

    expect(typeof strengthMachineSession).to.not.equal('undefined')
    expect(typeof strengthMachineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof strengthMachineSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can create new machine session with access token', async function () {
    const newMachineSession = await metricsInstance.authenticateWithMachineToken({ machineToken: strengthMachineSession.accessToken, strengthMachineIdentifier })

    expect(typeof newMachineSession).to.not.equal('undefined')
    expect(typeof newMachineSession.sessionHandler).to.not.equal('undefined')
    expect(typeof newMachineSession.sessionHandler.accessToken).to.equal('string')
    expect(newMachineSession.sessionHandler.accessToken).to.not.equal(strengthMachineSession.accessToken)
  })

  it('can use machine session to login user', async function () {
    const facilityRelationship = await privilegedFacility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Archie Richards', memberIdentifier: newUserMemberId })
    facilityUserSession = await strengthMachineSession.userLogin({ memberIdentifier: facilityRelationship.memberIdentifier as string })
    expect(typeof facilityUserSession).to.not.equal('undefined')
    expect(typeof facilityUserSession.user).to.not.equal('undefined')
    expect(facilityUserSession.user.id).to.equal(facilityRelationship.userId)
    expect(facilityUserSession.facilityRelationship.id).to.equal(facilityRelationship.id)
  })

  it('can create A500 utilization instance', async function () {
    await strengthMachineSession.createA500UtilizationInstance({ takenAt: new Date(), repetitionCount: 15 })
  })

  it('can create A500 data set', async function () {
    this.timeout(10000)

    const response = await facilityUserSession.user.createA500Set({
      strengthMachineSession,
      setData: a500SetDataSample,
      sampleData: a500TimeSeriesDataPointSamples
    })

    expect(typeof response).to.not.equal('undefined')
    expect(response.id).to.not.equal(0)

    a500ResultId = response.id
    strengthMachineId = response.eagerStrengthMachine()?.id ?? 1053
  })

  it('can retrieve a500 data set', async function () {
    this.timeout(10000)
    if (typeof a500ResultId === 'undefined') {
      this.skip()
    }

    const response = await facilityUserSession.user.getStrengthMachineDataSet({ id: a500ResultId })

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

  it('can get a user\'s Strength Machine Profile Stats', async function () {
    const strengthMachineProfileStats = await facilityUserSession.user.getStrengthMachineProfileStats({ strengthMachineId: strengthMachineId })

    expect(typeof strengthMachineProfileStats).to.equal('object')
    expect(strengthMachineProfileStats.peakPower).to.equal(496)
    expect(strengthMachineProfileStats.peakVelocity).to.equal(3.15)
    createdStrengthMachineProfileStats = strengthMachineProfileStats
  })

  it('can reload Strength Machine Profile Stats', async function () {
    const strengthMachineProfileStats = await createdStrengthMachineProfileStats.reload()

    expect(typeof strengthMachineProfileStats).to.equal('object')
    expect(strengthMachineProfileStats.peakPower).to.equal(496)
    expect(strengthMachineProfileStats.peakVelocity).to.equal(3.15)
  })

  it('can export a500 data set in action', async function () {
    this.timeout(10000)
    if (typeof a500ResultId === 'undefined') {
      this.skip()
    }

    const strengthMachineDataSet = await facilityUserSession.user.getStrengthMachineDataSet({ id: a500ResultId })

    expect(typeof strengthMachineDataSet).to.not.equal('undefined')
    expect(strengthMachineDataSet.id).to.equal(a500ResultId)

    const exportBuffer = await strengthMachineDataSet.getExportBuffer({ format: StrengthMachineDataSetExportFormat.KA5 })

    expect(typeof exportBuffer).to.not.equal('undefined')
    expect(new TextDecoder('utf-8').decode(new Uint8Array(exportBuffer).slice(0, 6))).to.equal('ka5.1!')

    const strengthMachineDataSetData = decompressKA5FromBuffer(exportBuffer)
    expect(typeof strengthMachineDataSetData).to.equal('object')
    expect(typeof strengthMachineDataSetData.user).to.equal('object')
  })

  it('can export a500 data set to flat file', async function () {
    this.timeout(10000)
    if (typeof a500ResultId === 'undefined') {
      this.skip()
    }

    const strengthMachineDataSet = await facilityUserSession.user.getStrengthMachineDataSet({ id: a500ResultId })

    expect(typeof strengthMachineDataSet).to.not.equal('undefined')
    expect(strengthMachineDataSet.id).to.equal(a500ResultId)

    const exportUrl = strengthMachineDataSet.getFlatExportUrl({ format: StrengthMachineDataSetExportFormat.KA5 })

    expect(typeof exportUrl).to.equal('string')
    const response = await axios.get(exportUrl, { responseType: 'arraybuffer' })
    expect(response.status).to.equal(200)
    expect(typeof response.data).to.equal('object')

    const strengthMachineDataSetData = decompressKA5FromBuffer(response.data)
    expect(typeof strengthMachineDataSetData).to.equal('object')
    expect(typeof strengthMachineDataSetData.user).to.equal('object')
  })
})
