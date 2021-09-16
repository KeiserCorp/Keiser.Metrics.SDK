import { expect } from 'chai'

import Metrics from '../src/core'
import { HeightMeasurement, HeightMeasurementSorting } from '../src/models/heightMeasurement'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Height Measurement', function () {
  let metricsInstance: Metrics
  let user: User
  let createdHeightMeasurement: HeightMeasurement

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('has height measurements on first load', async function () {
    const heightMeasurements = user.eagerHeightMeasurements()
    expect(Array.isArray(heightMeasurements)).to.equal(true)
    if (Array.isArray(heightMeasurements)) {
      expect(heightMeasurements.length).to.equal(1)
      expect(typeof heightMeasurements[0]).to.equal('object')
    }
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
  })

  it('can get new latest height measurement', async function () {
    const heightMeasurements = await user.getHeightMeasurements({ limit: 1 })

    expect(Array.isArray(heightMeasurements)).to.equal(true)
    expect(heightMeasurements.length).to.equal(1)
    expect(typeof heightMeasurements[0]).to.equal('object')
    expect(heightMeasurements[0].source).to.equal('test')
    expect(heightMeasurements[0].metricHeight).to.equal(182)

    createdHeightMeasurement = heightMeasurements[0]
  })

  it('can get specific height measurement', async function () {
    const heightMeasurement = await user.getHeightMeasurement({ id: createdHeightMeasurement.id })

    expect(typeof heightMeasurement).to.equal('object')
    expect(heightMeasurement.source).to.equal('test')
    expect(heightMeasurement.id).to.equal(createdHeightMeasurement.id)
    expect(heightMeasurement.source).to.equal(createdHeightMeasurement.source)
    expect(heightMeasurement.metricHeight).to.equal(createdHeightMeasurement.metricHeight)
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

  it('can subscribe to height measurement changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const heightMeasurement = (await user.getHeightMeasurements({ limit: 1 }))[0]

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = heightMeasurement.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'delete' && e.id === heightMeasurement.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await heightMeasurement.delete()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('delete')
    expect(modelChangeEvent.id).to.equal(heightMeasurement.id)
  })

  it('can subscribe to height measurement list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const heightMeasurements = await user.getHeightMeasurements({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = heightMeasurements.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (heightMeasurements.length === 0 || e.id !== heightMeasurements[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const heightMeasurement = await user.createHeightMeasurement({ source: 'test', takenAt: new Date(), metricHeight: 180 })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(heightMeasurement.id)
  })
})
