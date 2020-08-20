import { expect } from 'chai'
import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementSorting } from '../src/models/mSeriesFtpMeasurement'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('M Series FTP Measurement', function () {
  let metricsInstance: Metrics
  let user: User
  let mSeriesFtpMeasurement: MSeriesFtpMeasurement

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    let userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list M Series ftp measurements', async function () {
    const mSeriesFtpMeasurements = await user.getMSeriesFtpMeasurements()

    expect(Array.isArray(mSeriesFtpMeasurements)).to.equal(true)
    expect(mSeriesFtpMeasurements.meta.sort).to.equal(MSeriesFtpMeasurementSorting.TakenAt)
  })

  it('can create new M Series FTP measurement', async function () {
    mSeriesFtpMeasurement = await user.createMSeriesFtpMeasurement({
      source: 'test',
      takenAt: new Date(),
      machineType: 'm3i',
      ftp: 150
    })

    expect(typeof mSeriesFtpMeasurement).to.equal('object')
    expect(mSeriesFtpMeasurement.ftp).to.equal(150)
  })

  it('can reload M Series FTP measurement', async function () {
    mSeriesFtpMeasurement = await mSeriesFtpMeasurement.reload()

    expect(typeof mSeriesFtpMeasurement).to.equal('object')
    expect(mSeriesFtpMeasurement.ftp).to.equal(150)
  })

  it('can delete M Series FTP measurement', async function () {
    await mSeriesFtpMeasurement.delete()

    let extError

    try {
      await mSeriesFtpMeasurement.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
