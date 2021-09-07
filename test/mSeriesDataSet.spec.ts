import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { MSeriesDataSet, MSeriesDataSetSorting } from '../src/models/mSeriesDataSet'
import { User } from '../src/models/user'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

const generateMSeriesDataSet = () => {
  const startTime = (new Date()).getTime()
  return [...new Array(1000)].map((v, index) => ({
    takenAt: new Date(startTime + (333 * index)),
    realTime: true,
    interval: 0,
    cadence: (Math.random() * 20) + 80,
    power: (Math.random() * 150) + 100,
    caloricBurn: (index / 10),
    duration: ((index / 3) * 1000) + 8000,
    distance: (index / 300),
    heartRate: 60 + (index % 100),
    gear: (Math.random() * 10) + 10
  }))
}

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
})
