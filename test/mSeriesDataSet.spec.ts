import { expect } from 'chai'
import Metrics from '../src'
import { MSeriesDataSet, MSeriesDataSetSorting } from '../src/models/mSeriesDataSet'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'
import { UnknownEntityError } from '../src/error'

const generateMSeriesDataSet = () => {
  const startTime = (new Date()).getTime()
  return [1000].map((v, index) => ({
    takenAt: new Date(startTime + (300 * index)),
    realTime: true,
    interval: 0,
    cadence: (Math.random() * 20) + 80,
    power: (Math.random() * 150) + 100,
    caloricBurn: (index / 10),
    duration: (index / 3),
    distance: (index / 300),
    heartRate: 60 + (index % 100),
    gear: (Math.random() * 10) + 10
  }))
}

describe('M Series Data Set', function () {
  let metricsInstance: Metrics
  let user: User
  let mSeriesDataSet: MSeriesDataSet

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

  it('can list M Series data set', async function () {
    const mSeriesDataSets = await user.getMSeriesDataSets()

    expect(Array.isArray(mSeriesDataSets)).to.equal(true)
    expect(mSeriesDataSets.meta.sort).to.equal(MSeriesDataSetSorting.StartedAt)
  })

  it('can create new M Series data set', async function () {
    const genDataSet = generateMSeriesDataSet()
    mSeriesDataSet = await user.createMSeriesDataSet({
      source: 'test',
      machineType: 'm3i',
      ordinalId: 0,
      buildMajor: 6,
      buildMinor: 30,
      mSeriesDataPoints: genDataSet
    })

    expect(typeof mSeriesDataSet).to.equal('object')
    expect(mSeriesDataSet.buildMajor).to.equal(6)
  })

  it('can reload M Series data set', async function () {
    mSeriesDataSet = await mSeriesDataSet.reload()

    expect(typeof mSeriesDataSet).to.equal('object')
    expect(mSeriesDataSet.buildMajor).to.equal(6)
  })

  it('can delete M Series data set', async function () {
    await mSeriesDataSet.delete()

    let extError

    try {
      await mSeriesDataSet.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
