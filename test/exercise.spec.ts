import { expect } from 'chai'
import Metrics from '../src'
import { ExerciseSorting } from '../src/models/exercise'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Exercise', function () {
  let metricsInstance: Metrics
  let userSession: UserSession

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list available exercises', async function () {
    const exercises = await userSession.user.getExercises()

    expect(Array.isArray(exercises)).to.equal(true)
    expect(exercises.length).to.be.above(0)
    expect(exercises.meta.sort).to.equal(ExerciseSorting.ID)
  })

})
