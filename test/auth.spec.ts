import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'

describe('Auth', function () {
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

  it('can authenticate using basic credentials', async function () {
    const session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    console.log(session)

    expect(session).to.be.an('object')
    expect(session.user).to.be.an('object')
    expect(session.user.id).to.be.a('number')
  })

})
