import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementSorting } from '../src/models/mSeriesFtpMeasurement'
import { User } from '../src/models/user'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('M Series FTP Measurement', function () {
  let metricsInstance: MetricsSSO
  let user: User
  let createdMSeriesFtpMeasurement: MSeriesFtpMeasurement

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await AuthenticatedUser(metricsInstance)
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
    const mSeriesFtpMeasurement = await user.createMSeriesFtpMeasurement({
      source: 'test',
      takenAt: new Date(),
      machineType: 'm3i',
      ftp: 150
    })

    expect(typeof mSeriesFtpMeasurement).to.equal('object')
    expect(mSeriesFtpMeasurement.ftp).to.equal(150)
    createdMSeriesFtpMeasurement = mSeriesFtpMeasurement
  })

  it('can reload M Series FTP measurement', async function () {
    const mSeriesFtpMeasurement = await createdMSeriesFtpMeasurement.reload()

    expect(typeof mSeriesFtpMeasurement).to.equal('object')
    expect(mSeriesFtpMeasurement.ftp).to.equal(150)
  })

  it('can get specific M Series FTP measurement', async function () {
    const mSeriesFtpMeasurement = await user.getMSeriesFtpMeasurement({ id: createdMSeriesFtpMeasurement.id })

    expect(typeof mSeriesFtpMeasurement).to.equal('object')
    expect(mSeriesFtpMeasurement.id).to.equal(createdMSeriesFtpMeasurement.id)
    expect(mSeriesFtpMeasurement.ftp).to.equal(createdMSeriesFtpMeasurement.ftp)
  })

  it('can delete M Series FTP measurement', async function () {
    await createdMSeriesFtpMeasurement.delete()

    let extError

    try {
      await createdMSeriesFtpMeasurement.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
