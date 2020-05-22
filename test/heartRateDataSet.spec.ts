import { expect } from 'chai'
import Metrics from '../src'
import { HeartRateDataSet, HeartRateDataSetSorting } from '../src/models/heartRateDataSet'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { UnknownEntityError } from '../src/error'

const generateHeartRateDataSet = () => {
  const startTime = (new Date()).getTime()
  return [1000].map((v, index) => ({
    takenAt: new Date(startTime + (300 * index)),
    heartRate: 60 + (index % 100)
  }))
}

describe('Heart Rate Data Set', function () {
  let metricsInstance: Metrics
  let user: User
  let heartRateDataSet: HeartRateDataSet

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

  it('can list heart rate data set', async function () {
    const heartRateDataSets = await user.getHeartRateDataSets()

    expect(Array.isArray(heartRateDataSets)).to.equal(true)
    expect(heartRateDataSets.meta.sort).to.equal(HeartRateDataSetSorting.StartedAt)
  })

  it('can create new heart rate data set', async function () {
    const genDataSet = generateHeartRateDataSet()
    heartRateDataSet = await user.createHeartRateDataSet({
      source: 'test',
      heartRateDataPoints: genDataSet
    })

    expect(typeof heartRateDataSet).to.equal('object')
    expect(heartRateDataSet.maxHeartRate).to.be.above(0)
  })

  it('can reload heart rate data set', async function () {
    heartRateDataSet = await heartRateDataSet.reload()

    expect(typeof heartRateDataSet).to.equal('object')
    expect(heartRateDataSet.maxHeartRate).to.be.above(0)
  })

  it('can delete heart rate data set', async function () {
    await heartRateDataSet.delete()

    let extError

    try {
      await heartRateDataSet.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
