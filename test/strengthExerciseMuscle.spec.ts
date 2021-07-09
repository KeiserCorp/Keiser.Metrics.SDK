import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseMuscle } from '../src/models/strengthExerciseMuscle'
import { AdminSession, UserSession } from '../src/session'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Strength Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseMuscle: PrivilegedStrengthExerciseMuscle

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })

    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: randomCharacterSequence(16),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovement.Compound,
      plane: StrengthExercisePlane.Sagittal
    })
  })

  after(async function () {
    await createdStrengthExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
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
        targetLevel: MuscleTargetLevel.Stabilizer
      }
      await createdStrengthExerciseMuscle.update(strengthExerciseMuscleParams)
      expect(createdStrengthExerciseMuscle).to.be.an('object')
      expect(createdStrengthExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdStrengthExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Stabilizer)
    }
  })

  it('can delete exercise', async function () {
    if (typeof createdStrengthExerciseMuscle !== 'undefined') {
      let extError

      await createdStrengthExerciseMuscle.delete()

      try {
        await createdStrengthExerciseMuscle.reload()
      } catch (error) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError.code).to.equal(UnknownEntityError.code)
    }
  })
})
