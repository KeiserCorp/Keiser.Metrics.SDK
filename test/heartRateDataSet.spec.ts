import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { HeartRateDataSet, HeartRateDataSetSorting } from '../src/models/heartRateDataSet'
import { User } from '../src/models/user'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

const generateHeartRateDataSet = () => {
  const startTime = (new Date()).getTime()
  return [1000].map((v, index) => ({
    takenAt: new Date(startTime + (300 * index)),
    heartRate: 60 + (index % 100)
  }))
}

describe('Heart Rate Data Set', function () {
  let metricsInstance: MetricsSSO
  let user: User
  let createdHeartRateDataSet: HeartRateDataSet

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

  it('can list heart rate data set', async function () {
    const heartRateDataSets = await user.getHeartRateDataSets()

    expect(Array.isArray(heartRateDataSets)).to.equal(true)
    expect(heartRateDataSets.meta.sort).to.equal(HeartRateDataSetSorting.StartedAt)
  })

  it('can create new heart rate data set', async function () {
    const genDataSet = generateHeartRateDataSet()
    const heartRateDataSet = await user.createHeartRateDataSet({
      source: 'test',
      heartRateDataPoints: genDataSet
    })

    expect(typeof heartRateDataSet).to.equal('object')
    expect(heartRateDataSet.maxHeartRate).to.be.above(0)
    createdHeartRateDataSet = heartRateDataSet
  })

  it('can reload heart rate data set', async function () {
    const heartRateDataSet = await createdHeartRateDataSet.reload()

    expect(typeof heartRateDataSet).to.equal('object')
    expect(heartRateDataSet.maxHeartRate).to.be.above(0)
  })

  it('can get specific heart rate data set', async function () {
    const heartRateDataSet = await user.getHeartRateDataSet({ id: createdHeartRateDataSet.id })

    expect(typeof heartRateDataSet).to.equal('object')
    expect(heartRateDataSet.id).to.equal(createdHeartRateDataSet.id)
    expect(heartRateDataSet.maxHeartRate).to.equal(createdHeartRateDataSet.maxHeartRate)
  })

  it('can delete heart rate data set', async function () {
    await createdHeartRateDataSet.delete()

    let extError

    try {
      await createdHeartRateDataSet.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
