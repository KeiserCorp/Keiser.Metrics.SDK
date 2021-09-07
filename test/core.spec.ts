import { expect } from 'chai'

import Metrics from '../src/core'
import { getMetricsInstance } from './utils/fixtures'

describe('Core', function () {
  let metricsInstance: Metrics

  before(function () {
    metricsInstance = getMetricsInstance()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get health', async function () {
    const { healthy } = await metricsInstance.core.health()

    expect(healthy).to.equal(true)
  })

  it('can get status', async function () {
    const status = await metricsInstance.core.status()

    expect(status).to.be.an('object')
    expect(status.name).to.equal('keiser.metrics.api')
  })
})
