import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane, StrengthExerciseSorting } from '../src/models/strengthExercise'
import { AdminSession, UserSession } from '../src/session'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Strength Exercise', function () {
  const newExerciseName = randomCharacterSequence(16)

  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStrengthExercise: PrivilegedStrengthExercise

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

  it('can create strength exercise', async function () {
    const strengthExerciseParams = {
      defaultExerciseAlias: newExerciseName,
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovement.Compound,
      plane: StrengthExercisePlane.Sagittal
    }
    const strengthExercise = await adminSession.createStrengthExercise(strengthExerciseParams)

    expect(strengthExercise).to.be.an('object')
    const defaultExerciseAlias = strengthExercise.eagerDefaultExerciseAlias()
    expect(defaultExerciseAlias).to.be.an('object')
    expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    expect(strengthExercise.category).to.equal(StrengthExerciseCategory.Complex)
    expect(strengthExercise.movement).to.equal(StrengthExerciseMovement.Compound)
    expect(strengthExercise.plane).to.equal(StrengthExercisePlane.Sagittal)
    createdStrengthExercise = strengthExercise
  })

  it('can list available strength exercises', async function () {
    const strengthExercises = await userSession.getStrengthExercises()

    expect(Array.isArray(strengthExercises)).to.equal(true)
    expect(strengthExercises.length).to.be.above(0)
    expect(strengthExercises.meta.sort).to.equal(StrengthExerciseSorting.ID)
  })

  it('can reload strength exercise', async function () {
    expect(createdStrengthExercise).to.be.an('object')
    if (typeof createdStrengthExercise !== 'undefined') {
      await createdStrengthExercise.reload()
      expect(createdStrengthExercise).to.be.an('object')
      const defaultExerciseAlias = createdStrengthExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
      expect(createdStrengthExercise.category).to.equal(StrengthExerciseCategory.Complex)
      expect(createdStrengthExercise.movement).to.equal(StrengthExerciseMovement.Compound)
      expect(createdStrengthExercise.plane).to.equal(StrengthExercisePlane.Sagittal)
    }
  })

  it('can get specific strength exercise', async function () {
    expect(createdStrengthExercise).to.be.an('object')
    if (typeof createdStrengthExercise !== 'undefined') {
      const strengthExercise = await userSession.getStrengthExercise({ id: createdStrengthExercise.id })
      const defaultExerciseAlias = strengthExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
      expect(strengthExercise.category).to.equal(StrengthExerciseCategory.Complex)
      expect(strengthExercise.movement).to.equal(StrengthExerciseMovement.Compound)
      expect(strengthExercise.plane).to.equal(StrengthExercisePlane.Sagittal)
    }
  })

  it('can list strength exercises with privileges', async function () {
    const strengthExercises = await adminSession.getStrengthExercises()

    expect(Array.isArray(strengthExercises)).to.equal(true)
    expect(strengthExercises.length).to.be.above(0)
    expect(strengthExercises.meta.sort).to.equal(StrengthExerciseSorting.ID)
    expect(typeof strengthExercises[0].update).to.equal('function')
  })

  it('can update strength exercise', async function () {
    if (typeof createdStrengthExercise !== 'undefined') {
      const strengthExercise = await adminSession.getStrengthExercise({ id: createdStrengthExercise.id })
      const strengthExerciseParams = {
        category: StrengthExerciseCategory.Explosive,
        movement: StrengthExerciseMovement.Isolation,
        plane: StrengthExercisePlane.Frontal
      }
      await strengthExercise.update(strengthExerciseParams)
      expect(strengthExercise).to.be.an('object')
      expect(strengthExercise.category).to.equal(StrengthExerciseCategory.Explosive)
      expect(strengthExercise.movement).to.equal(StrengthExerciseMovement.Isolation)
      expect(strengthExercise.plane).to.equal(StrengthExercisePlane.Frontal)
    }
  })

  it('can delete exercise', async function () {
    let extError

    const strengthExercise = await adminSession.getStrengthExercise({ id: createdStrengthExercise.id })
    await strengthExercise.delete()

    try {
      await strengthExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
