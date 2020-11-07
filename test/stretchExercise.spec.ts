import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedStretchExercise, StretchExerciseSorting } from '../src/models/stretchExercise'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Stretch Exercise', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStretchExercise: PrivilegedStretchExercise
  const newExerciseName = newNameGen()

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

  after(async function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create stretch exercise', async function () {
    const stretchExerciseParams = {
      defaultExerciseAlias: newExerciseName
    }
    const stretchExercise = await adminSession.createStretchExercise(stretchExerciseParams)

    expect(stretchExercise).to.be.an('object')
    const defaultExerciseAlias = stretchExercise.eagerDefaultExerciseAlias()
    expect(defaultExerciseAlias).to.be.an('object')
    expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    createdStretchExercise = stretchExercise
  })

  it('can list available stretch exercises', async function () {
    const stretchExercises = await userSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
  })

  it('can reload stretch exercise', async function () {
    expect(createdStretchExercise).to.be.an('object')
    if (typeof createdStretchExercise !== 'undefined') {
      await createdStretchExercise.reload()
      expect(createdStretchExercise).to.be.an('object')
      const defaultExerciseAlias = createdStretchExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can get specific stretch exercise', async function () {
    expect(createdStretchExercise).to.be.an('object')
    if (typeof createdStretchExercise !== 'undefined') {
      const stretchExercise = await userSession.getStretchExercise({ id: createdStretchExercise.id })
      const defaultExerciseAlias = stretchExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can list stretch exercises with privileges', async function () {
    const stretchExercises = await adminSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
    expect(typeof stretchExercises[0].delete).to.equal('function')
  })

  it('can delete exercise', async function () {
    let extError

    const stretchExercise = await adminSession.getStretchExercise({ id: createdStretchExercise.id })
    await stretchExercise.delete()

    try {
      await stretchExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
