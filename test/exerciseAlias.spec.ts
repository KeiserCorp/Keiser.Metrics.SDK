import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { Exercise } from '../src/models/exercise'
import { ExerciseAlias, ExerciseAliasSorting } from '../src/models/exerciseAlias'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Exercise Alias', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let newExerciseAlias: ExerciseAlias
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
    existingExercise = (await userSession.getExercises({ limit: 1 }))[0]
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create exercise alias', async function () {
    const exerciseAliasParams = {
      exerciseId: existingExercise.id,
      alias: newNameGen()
    }
    const exerciseAlias = await adminSession.createExerciseAlias(exerciseAliasParams)

    expect(exerciseAlias).to.be.an('object')
    expect(exerciseAlias.exercise).to.be.an('object')
    expect(exerciseAlias.alias).to.equal(exerciseAlias.alias)
    newExerciseAlias = exerciseAlias
  })

  it('can list available exercise aliases', async function () {
    const exerciseAliases = await userSession.getExerciseAliases()

    expect(Array.isArray(exerciseAliases)).to.equal(true)
    expect(exerciseAliases.length).to.be.above(0)
    expect(exerciseAliases.meta.sort).to.equal(ExerciseAliasSorting.ID)
  })

  it('can reload exercise alias', async function () {
    expect(newExerciseAlias).to.be.an('object')
    if (typeof newExerciseAlias !== 'undefined') {
      await newExerciseAlias.reload()
      expect(newExerciseAlias).to.be.an('object')
    }
  })

  it('can get specific exercise alias', async function () {
    expect(newExerciseAlias).to.be.an('object')
    if (typeof newExerciseAlias !== 'undefined') {
      const exerciseAlias = await userSession.getExerciseAlias({ id: newExerciseAlias.id })

      expect(exerciseAlias).to.be.an('object')
      expect(exerciseAlias.id).to.equal(newExerciseAlias.id)
    }
  })

  it('can list exercise aliases with privileges', async function () {
    const exerciseAliases = await adminSession.getExerciseAliases()

    expect(Array.isArray(exerciseAliases)).to.equal(true)
    expect(exerciseAliases.length).to.be.above(0)
    expect(exerciseAliases.meta.sort).to.equal(ExerciseAliasSorting.ID)
    expect(typeof exerciseAliases[0].update).to.equal('function')
  })

  it('can update exercise alias', async function () {
    if (typeof newExerciseAlias !== 'undefined') {
      const newName = newNameGen()
      const exerciseAlias = await adminSession.getExerciseAlias({ id: newExerciseAlias.id })
      await exerciseAlias.update({ alias: newName })
      expect(exerciseAlias).to.be.an('object')
      expect(exerciseAlias.alias).to.equal(newName)
    }
  })

  it('can delete exercise', async function () {
    let extError

    const exerciseAlias = await adminSession.getExerciseAlias({ id: newExerciseAlias.id })
    await exerciseAlias.delete()

    try {
      await exerciseAlias.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
