import { expect } from 'chai'

import Metrics from '../src/core'
import { DevRestEndpoint, DevSocketEndpoint, IsBrowser } from './utils/constants'

describe('Base', function () {
  it('can create instance with properties', function () {
    const metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint
    })

    expect(metricsInstance).to.be.an('object')
    expect(typeof metricsInstance.persistConnection).to.equal('boolean')
    metricsInstance.dispose()
  })

  it('can create instance with defaults', function () {
    const metricsInstance = new Metrics()

    expect(metricsInstance).to.be.an('object')
    expect(typeof metricsInstance.persistConnection).to.equal('boolean')
    metricsInstance.dispose()
  })

  it('can create non-persistent connection instance', function () {
    const metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: false
    })

    expect(metricsInstance).to.be.an('object')
    expect(metricsInstance.persistConnection).to.equal(false)
    metricsInstance.dispose()
  })

  it('can dispose instance', function () {
    const metricsInstance = new Metrics()
    expect(metricsInstance.persistConnection).to.equal(IsBrowser)
    metricsInstance.dispose()
    expect(metricsInstance.persistConnection).to.equal(false)
  })
})
