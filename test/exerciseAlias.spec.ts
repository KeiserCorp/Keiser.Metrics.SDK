import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { ExerciseAliasSorting, PrivilegedExerciseAlias } from '../src/models/exerciseAlias'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane } from '../src/models/strengthExercise'
import { AdminSession, UserSession } from '../src/session'
import { randomLetterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Exercise Alias', function () {
  const newAlias = randomLetterSequence(26)

  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let newStrengthExercise: PrivilegedStrengthExercise
  let newExerciseAlias: PrivilegedExerciseAlias

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })

    newStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: randomLetterSequence(26),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovement.Compound,
      plane: StrengthExercisePlane.Sagittal
    })
  })

  after(async function () {
    await newStrengthExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
  })

  it('can create exercise alias', async function () {
    const exerciseAlias = await newStrengthExercise.createExerciseAlias({ alias: newAlias })

    expect(exerciseAlias).to.be.an('object')
    expect(exerciseAlias.alias).to.equal(newAlias)

    newExerciseAlias = exerciseAlias
  })

  it('can reload exercise alias', async function () {
    await newExerciseAlias.reload()
    expect(newExerciseAlias).to.be.an('object')
    expect(newExerciseAlias.alias).to.equal(newAlias)
  })

  it('can list available exercise aliases', async function () {
    const exerciseAliases = await userSession.getExerciseAliases()

    expect(Array.isArray(exerciseAliases)).to.equal(true)
    expect(exerciseAliases.length).to.be.above(0)
    expect(exerciseAliases.meta.sort).to.equal(ExerciseAliasSorting.ID)
  })

  it('can get specific exercise alias', async function () {
    expect(newExerciseAlias).to.be.an('object')
    const exerciseAlias = await userSession.getExerciseAlias({ id: newExerciseAlias.id })

    expect(exerciseAlias).to.be.an('object')
    expect(exerciseAlias.id).to.equal(newExerciseAlias.id)
  })

  it('can list exercise aliases with privileges', async function () {
    const exerciseAliases = await adminSession.getExerciseAliases()

    expect(Array.isArray(exerciseAliases)).to.equal(true)
    expect(exerciseAliases.length).to.be.above(0)
    expect(exerciseAliases.meta.sort).to.equal(ExerciseAliasSorting.ID)
    expect(typeof exerciseAliases[0].update).to.equal('function')
  })

  it('can update exercise alias', async function () {
    const newName = randomLetterSequence(26)
    const exerciseAlias = await adminSession.getExerciseAlias({ id: newExerciseAlias.id })
    await exerciseAlias.update({ alias: newName })
    expect(exerciseAlias).to.be.an('object')
    expect(exerciseAlias.alias).to.equal(newName)
  })

  it('can delete exercise alias', async function () {
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
