import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { CardioExerciseSorting, PrivilegedCardioExercise } from '../src/models/cardioExercise'
import { AdminSession, UserSession } from '../src/session'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Cardio Exercise', function () {
  const newExerciseName = randomCharacterSequence(16)

  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdCardioExercise: PrivilegedCardioExercise

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
  })

  it('can create cardio exercise', async function () {
    const cardioExerciseParams = {
      defaultExerciseAlias: newExerciseName
    }
    const cardioExercise = await adminSession.createCardioExercise(cardioExerciseParams)

    expect(cardioExercise).to.be.an('object')
    const defaultExerciseAlias = cardioExercise.eagerDefaultExerciseAlias()
    expect(defaultExerciseAlias).to.be.an('object')
    expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    createdCardioExercise = cardioExercise
  })

  it('can list available cardio exercises', async function () {
    const cardioExercises = await userSession.getCardioExercises()

    expect(Array.isArray(cardioExercises)).to.equal(true)
    expect(cardioExercises.length).to.be.above(0)
    expect(cardioExercises.meta.sort).to.equal(CardioExerciseSorting.ID)
  })

  it('can reload cardio exercise', async function () {
    expect(createdCardioExercise).to.be.an('object')
    if (typeof createdCardioExercise !== 'undefined') {
      await createdCardioExercise.reload()
      expect(createdCardioExercise).to.be.an('object')
      const defaultExerciseAlias = createdCardioExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can get specific cardio exercise', async function () {
    expect(createdCardioExercise).to.be.an('object')
    if (typeof createdCardioExercise !== 'undefined') {
      const cardioExercise = await userSession.getCardioExercise({ id: createdCardioExercise.id })
      const defaultExerciseAlias = cardioExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can list cardio exercises with privileges', async function () {
    const cardioExercises = await adminSession.getCardioExercises()

    expect(Array.isArray(cardioExercises)).to.equal(true)
    expect(cardioExercises.length).to.be.above(0)
    expect(cardioExercises.meta.sort).to.equal(CardioExerciseSorting.ID)
    expect(typeof cardioExercises[0].delete).to.equal('function')
  })

  it('can delete exercise', async function () {
    let extError

    const cardioExercise = await adminSession.getCardioExercise({ id: createdCardioExercise.id })
    await cardioExercise.delete()

    try {
      await cardioExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
