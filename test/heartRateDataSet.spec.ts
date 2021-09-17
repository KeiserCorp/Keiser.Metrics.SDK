import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { HeartRateDataSet, HeartRateDataSetSorting } from '../src/models/heartRateDataSet'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

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
  let createdHeartRateDataSet: HeartRateDataSet

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    user = demoUserSession.user
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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can subscribe to heart rate data set changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const genDataSet = generateHeartRateDataSet()
    const heartRateDataSet = await user.createHeartRateDataSet({
      source: 'test',
      heartRateDataPoints: genDataSet
    })

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = heartRateDataSet.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'delete' && e.id === heartRateDataSet.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await heartRateDataSet.delete()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('delete')
    expect(modelChangeEvent.id).to.equal(heartRateDataSet.id)
  })

  it('can subscribe to heart rate data set list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const heartRateDataSets = await user.getHeartRateDataSets({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = heartRateDataSets.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (heartRateDataSets.length === 0 || e.id !== heartRateDataSets[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const genDataSet = generateHeartRateDataSet()
    const heartRateDataSet = await user.createHeartRateDataSet({
      source: 'test',
      heartRateDataPoints: genDataSet
    })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(heartRateDataSet.id)

    await heartRateDataSet.delete()
  })
})
