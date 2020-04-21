import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { User } from '../src/models/user'

describe('M Series Data Set', function () {
  let metricsInstance: Metrics
  let user: User

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
  })

})
