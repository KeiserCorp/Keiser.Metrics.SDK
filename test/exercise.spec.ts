import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { Exercise, ExerciseSorting, ExerciseType, PrivilegedExercise } from '../src/models/exercise'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Exercise', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let newExercise: PrivilegedExercise
  let existingExercise: Exercise

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    adminSession = await metricsAdminInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
  })

  after(function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can list available exercises', async function () {
    const exercises = await userSession.getExercises()
    existingExercise = exercises[0]

    expect(Array.isArray(exercises)).to.equal(true)
    expect(exercises.length).to.be.above(0)
    expect(exercises.meta.sort).to.equal(ExerciseSorting.ID)
  })

  it('can reload exercise', async function () {
    expect(existingExercise).to.be.an('object')
    if (typeof existingExercise !== 'undefined') {
      await existingExercise.reload()
      expect(existingExercise).to.be.an('object')
    }
  })

  it('can get specific exercise', async function () {
    expect(existingExercise).to.be.an('object')
    if (typeof existingExercise !== 'undefined') {
      const exercise = await userSession.getExercise({ id: existingExercise.id })

      expect(exercise).to.be.an('object')
      expect(exercise.id).to.equal(existingExercise.id)
    }
  })

  it('can list exercises with privileges', async function () {
    const exercises = await adminSession.getExercises()

    expect(Array.isArray(exercises)).to.equal(true)
    expect(exercises.length).to.be.above(0)
    expect(exercises.meta.sort).to.equal(ExerciseSorting.ID)
    expect(typeof exercises[0].update).to.equal('function')
  })

  it('can create exercise', async function () {
    const exercise = {
      name: newNameGen(),
      type: ExerciseType.Strength
    }
    newExercise = await adminSession.createExercise(exercise)

    expect(newExercise).to.be.an('object')
    expect(newExercise.name).to.equal(newExercise.name)
    expect(newExercise.type).to.equal(ExerciseType.Strength)
  })

  it('can update exercise', async function () {
    const newName = newNameGen()
    await newExercise.update({ name: newName, type: ExerciseType.Stretch })
    expect(newExercise).to.be.an('object')
    expect(newExercise.name).to.equal(newName)
    expect(newExercise.type).to.equal(ExerciseType.Stretch)
  })

  it('can delete exercise', async function () {
    let extError

    await newExercise.delete()

    try {
      await newExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
