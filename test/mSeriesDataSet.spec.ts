import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { MSeriesDataSet, MSeriesDataSetSorting } from '../src/models/mSeriesDataSet'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { generateMSeriesDataSet } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('M Series Data Set', function () {
  let metricsInstance: Metrics
  let user: User
  let createdMSeriesDataSet: MSeriesDataSet

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    user = demoUserSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list M Series data set', async function () {
    const mSeriesDataSets = await user.getMSeriesDataSets()

    expect(Array.isArray(mSeriesDataSets)).to.equal(true)
    expect(mSeriesDataSets.meta.sort).to.equal(MSeriesDataSetSorting.StartedAt)
  })

  it('can create new M Series data set', async function () {
    const genDataSet = generateMSeriesDataSet()
    const mSeriesDataSet = await user.createMSeriesDataSet({
      source: 'test',
      machineType: 'm3i',
      ordinalId: 0,
      buildMajor: 6,
      buildMinor: 30,
      mSeriesDataPoints: genDataSet
    })

    expect(typeof mSeriesDataSet).to.equal('object')
    expect(mSeriesDataSet.buildMajor).to.equal(6)
    createdMSeriesDataSet = mSeriesDataSet
  })

  it('can reload M Series data set', async function () {
    const mSeriesDataSet = await createdMSeriesDataSet.reload()

    expect(typeof mSeriesDataSet).to.equal('object')
    expect(mSeriesDataSet.buildMajor).to.equal(6)
  })

  it('can get specific M Series data set', async function () {
    const mSeriesDataSet = await user.getMSeriesDataSet({ id: createdMSeriesDataSet.id })

    expect(typeof mSeriesDataSet).to.equal('object')
    expect(mSeriesDataSet.id).to.equal(createdMSeriesDataSet.id)
    expect(mSeriesDataSet.buildMajor).to.equal(createdMSeriesDataSet.buildMajor)
    expect(mSeriesDataSet.duration).to.equal(333)
    expect(mSeriesDataSet.initialOffset).to.equal(8)
  })

  it('can delete M Series data set', async function () {
    await createdMSeriesDataSet.delete()

    let extError

    try {
      await createdMSeriesDataSet.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can subscribe to M Series data set changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const genDataSet = generateMSeriesDataSet()
    const mSeriesDataSet = await user.createMSeriesDataSet({
      source: 'test',
      machineType: 'm3i',
      ordinalId: 0,
      buildMajor: 6,
      buildMinor: 30,
      mSeriesDataPoints: genDataSet
    })

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = mSeriesDataSet.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'delete' && e.id === mSeriesDataSet.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await mSeriesDataSet.delete()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('delete')
    expect(modelChangeEvent.id).to.equal(mSeriesDataSet.id)
  })

  it('can subscribe to M Series data set list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const mSeriesDataSets = await user.getMSeriesDataSets({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = mSeriesDataSets.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (mSeriesDataSets.length === 0 || e.id !== mSeriesDataSets[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const genDataSet = generateMSeriesDataSet()
    const mSeriesDataSet = await user.createMSeriesDataSet({
      source: 'test',
      machineType: 'm3i',
      ordinalId: 0,
      buildMajor: 6,
      buildMinor: 30,
      mSeriesDataPoints: genDataSet
    })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(mSeriesDataSet.id)

    await mSeriesDataSet.delete()
  })
})
