import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExerciseMovementDEP, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseMuscle } from '../src/models/strengthExerciseMuscle'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Strength Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseMuscle: PrivilegedStrengthExerciseMuscle

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: randomCharacterSequence(16),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovementDEP.Compound,
      plane: StrengthExercisePlane.Sagittal,
      humanMovement: StrengthExerciseMovement.Bilateral
    })
  })

  after(async function () {
    await createdStrengthExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create strength exercise muscle', async function () {
    const strengthExerciseMuscleParams = {
      muscle: MuscleIdentifier.Deltoid,
      targetLevel: MuscleTargetLevel.Primary
    }
    const strengthExerciseMuscle = await createdStrengthExercise.createStrengthExerciseMuscle(strengthExerciseMuscleParams)

    expect(strengthExerciseMuscle).to.be.an('object')
    expect(strengthExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
    expect(strengthExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    createdStrengthExerciseMuscle = strengthExerciseMuscle
  })

  it('can reload strength exercise muscle', async function () {
    expect(createdStrengthExerciseMuscle).to.be.an('object')
    if (typeof createdStrengthExerciseMuscle !== 'undefined') {
      await createdStrengthExerciseMuscle.reload()
      expect(createdStrengthExerciseMuscle).to.be.an('object')
      expect(createdStrengthExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdStrengthExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can list strength exercise muscles', async function () {
    const strengthExerciseMuscles = await createdStrengthExercise.getStrengthExerciseMuscles()

    expect(Array.isArray(strengthExerciseMuscles)).to.equal(true)
    expect(strengthExerciseMuscles.length).to.be.above(0)
    expect(strengthExerciseMuscles.meta.sort).to.equal(MuscleSorting.ID)
  })

  it('can get specific strength exercise muscle', async function () {
    expect(createdStrengthExerciseMuscle).to.be.an('object')
    if (typeof createdStrengthExerciseMuscle !== 'undefined') {
      const strengthExerciseMuscle = await userSession.getStrengthExerciseMuscle({ id: createdStrengthExerciseMuscle.id })

      expect(strengthExerciseMuscle).to.be.an('object')
      expect(strengthExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(strengthExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can update strength exercise muscle', async function () {
    if (typeof createdStrengthExerciseMuscle !== 'undefined') {
      const strengthExerciseMuscleParams = {
        targetLevel: MuscleTargetLevel.Tertiary
      }
      await createdStrengthExerciseMuscle.update(strengthExerciseMuscleParams)
      expect(createdStrengthExerciseMuscle).to.be.an('object')
      expect(createdStrengthExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdStrengthExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Tertiary)
    }
  })

  it('can delete exercise', async function () {
    if (typeof createdStrengthExerciseMuscle !== 'undefined') {
      let extError

      await createdStrengthExerciseMuscle.delete()

      try {
        await createdStrengthExerciseMuscle.reload()
      } catch (error: any) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError?.code).to.equal(UnknownEntityError.code)
    }
  })
})
