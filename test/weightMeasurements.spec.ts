import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { UserSession } from '../src/session'
import { User } from '../src/models/user'
import { WeightMeasurement } from '../src/models/weightMeasurement'

describe('Weight Measurement', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  let createdWeightMeasurement: WeightMeasurement

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

  it('has latest weight measurement on first load', async function () {
    expect(typeof user.latestWeightMeasurement).to.not.equal('undefined')
    expect(typeof user.latestWeightMeasurement?.metricWeight).to.equal('number')
  })

  it('can get list of weight measurement', async function () {
    const weightMeasurements = await user.getWeightMeasurements()

    expect(Array.isArray(weightMeasurements)).to.equal(true)
    expect(weightMeasurements.length).to.be.above(0)
  })

  it('can get list of weight measurement with parameters', async function () {
    const weightMeasurements = await user.getWeightMeasurements({ limit: 2 })

    expect(Array.isArray(weightMeasurements)).to.equal(true)
  })

  it('can create weight measurement', async function () {
    const weightMeasurement = await user.createWeightMeasurement({ source: 'test', takenAt: new Date(), metricWeight: 80 })

    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('test')
    expect(weightMeasurement.metricWeight).to.equal(80)
    expect(weightMeasurement.imperialWeight).to.equal(176.4)
  })

  it('can get new latest weight measurement', async function () {
    const weightMeasurements = await user.getWeightMeasurements({ limit: 1 })

    expect(Array.isArray(weightMeasurements)).to.equal(true)
    expect(weightMeasurements.length).to.equal(1)
    expect(typeof weightMeasurements[0]).to.equal('object')
    expect(weightMeasurements[0].source).to.equal('test')
    expect(weightMeasurements[0].metricWeight).to.equal(80)
    expect(weightMeasurements[0].imperialWeight).to.equal(176.4)

    createdWeightMeasurement = weightMeasurements[0]
  })

  it('can reload new weight measurement', async function () {
    const weightMeasurement = await createdWeightMeasurement.reload()
    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.source).to.equal('test')
    expect(weightMeasurement.id).to.equal(createdWeightMeasurement.id)
    expect(weightMeasurement.source).to.equal(createdWeightMeasurement.source)
    expect(weightMeasurement.metricWeight).to.equal(createdWeightMeasurement.metricWeight)
  })

  it('can delete new weight measurement', async function () {
    await createdWeightMeasurement.delete()

    const weightMeasurements = await user.getWeightMeasurements({ limit: 1 })

    expect(weightMeasurements[0].id).to.not.equal(createdWeightMeasurement.id)
  })

})
