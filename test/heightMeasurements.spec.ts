import { expect } from 'chai'
import Metrics from '../src'
import { HeightMeasurement, HeightMeasurementSorting } from '../src/models/heightMeasurement'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Height Measurement', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  let createdHeightMeasurement: HeightMeasurement

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('has latest height measurement on first load', async function () {
    expect(typeof user.latestHeightMeasurement).to.not.equal('undefined')
    expect(typeof user.latestHeightMeasurement?.metricHeight).to.equal('number')
  })

  it('can get list of height measurement', async function () {
    const heightMeasurements = await user.getHeightMeasurements()

    expect(Array.isArray(heightMeasurements)).to.equal(true)
    expect(heightMeasurements.meta.sort).to.equal(HeightMeasurementSorting.TakenAt)
  })

  it('can get list of height measurement with parameters', async function () {
    const heightMeasurements = await user.getHeightMeasurements({ limit: 2 })

    expect(Array.isArray(heightMeasurements)).to.equal(true)
    expect(heightMeasurements.length).to.be.above(0)
  })

  it('can create height measurement', async function () {
    const heightMeasurement = await user.createHeightMeasurement({ source: 'test', takenAt: new Date(), metricHeight: 182 })

    expect(typeof heightMeasurement).to.equal('object')
    expect(heightMeasurement.source).to.equal('test')
    expect(heightMeasurement.metricHeight).to.equal(182)
    expect(heightMeasurement.imperialHeight).to.equal(71.7)
  })

  it('can get new latest height measurement', async function () {
    const heightMeasurements = await user.getHeightMeasurements({ limit: 1 })

    expect(Array.isArray(heightMeasurements)).to.equal(true)
    expect(heightMeasurements.length).to.equal(1)
    expect(typeof heightMeasurements[0]).to.equal('object')
    expect(heightMeasurements[0].source).to.equal('test')
    expect(heightMeasurements[0].metricHeight).to.equal(182)
    expect(heightMeasurements[0].imperialHeight).to.equal(71.7)

    createdHeightMeasurement = heightMeasurements[0]
  })

  it('can reload new height measurement', async function () {
    const heightMeasurement = await createdHeightMeasurement.reload()

    expect(typeof heightMeasurement).to.equal('object')
    expect(heightMeasurement.source).to.equal('test')
    expect(heightMeasurement.id).to.equal(createdHeightMeasurement.id)
    expect(heightMeasurement.source).to.equal(createdHeightMeasurement.source)
    expect(heightMeasurement.metricHeight).to.equal(createdHeightMeasurement.metricHeight)
  })

  it('can delete new height measurement', async function () {
    await createdHeightMeasurement.delete()

    const heightMeasurements = await user.getHeightMeasurements({ limit: 1 })

    expect(heightMeasurements[0].id).to.not.equal(createdHeightMeasurement.id)
  })

})
