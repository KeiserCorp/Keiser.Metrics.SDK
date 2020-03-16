import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import Metrics from '../src'

describe('Core', function () {
  let metricsInstance: Metrics

  before(function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get docs', async function () {
    const response = await metricsInstance.core.docs()

    expect(response.documentation).to.be.an('object')
  })

  it('can get health', async function () {
    const { healthy } = await metricsInstance.core.health()

    expect(healthy).to.equal(true)
  })

  it('cannot get stats without admin', async function () {
    let response
    try {
      response = await metricsInstance.core.stats()
    } catch ({ error }) {
      expect(error.code).to.equal(613)
    }
    expect(typeof response).to.equal('undefined')
  })

  it('can get status', async function () {
    let status = await metricsInstance.core.status()

    expect(status).to.be.an('object')
    expect(status.name).to.equal('keiser.metrics.api')
  })

})
