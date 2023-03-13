import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { PrivilegedCardioExercise } from '../src/models/cardioExercise'
import { PrivilegedCardioExerciseMuscle } from '../src/models/cardioExerciseMuscle'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Cardio Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdCardioExercise: PrivilegedCardioExercise
  let createdCardioExerciseMuscle: PrivilegedCardioExerciseMuscle

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    createdCardioExercise = await adminSession.createCardioExercise({
      defaultExerciseAlias: randomCharacterSequence(16)
    })
  })

  after(async function () {
    await createdCardioExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create cardio exercise muscle', async function () {
    const cardioExerciseMuscleParams = {
      muscle: MuscleIdentifier.Deltoid,
      targetLevel: MuscleTargetLevel.Primary
    }
    const cardioExerciseMuscle = await createdCardioExercise.createCardioExerciseMuscle(cardioExerciseMuscleParams)

    expect(cardioExerciseMuscle).to.be.an('object')
    expect(cardioExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
    expect(cardioExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    createdCardioExerciseMuscle = cardioExerciseMuscle
  })

  it('can reload cardio exercise muscle', async function () {
    expect(createdCardioExerciseMuscle).to.be.an('object')
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      await createdCardioExerciseMuscle.reload()
      expect(createdCardioExerciseMuscle).to.be.an('object')
      expect(createdCardioExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdCardioExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can list cardio exercise muscles', async function () {
    const cardioExerciseMuscles = await createdCardioExercise.getCardioExerciseMuscles()

    expect(Array.isArray(cardioExerciseMuscles)).to.equal(true)
    expect(cardioExerciseMuscles.length).to.be.above(0)
    expect(cardioExerciseMuscles.meta.sort).to.equal(MuscleSorting.ID)
  })

  it('can get specific cardio exercise muscle', async function () {
    expect(createdCardioExerciseMuscle).to.be.an('object')
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      const cardioExerciseMuscle = await userSession.getCardioExerciseMuscle({ id: createdCardioExerciseMuscle.id })

      expect(cardioExerciseMuscle).to.be.an('object')
      expect(cardioExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(cardioExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can update cardio exercise muscle', async function () {
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      const cardioExerciseMuscleParams = {
        targetLevel: MuscleTargetLevel.Tertiary
      }
      await createdCardioExerciseMuscle.update(cardioExerciseMuscleParams)
      expect(createdCardioExerciseMuscle).to.be.an('object')
      expect(createdCardioExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdCardioExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Tertiary)
    }
  })

  it('can delete exercise', async function () {
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      let extError

      await createdCardioExerciseMuscle.delete()

      try {
        await createdCardioExerciseMuscle.reload()
      } catch (error: any) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError?.code).to.equal(UnknownEntityError.code)
    }
  })
})
