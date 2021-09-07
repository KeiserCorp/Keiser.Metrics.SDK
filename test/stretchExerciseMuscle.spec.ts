import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { PrivilegedStretchExercise } from '../src/models/stretchExercise'
import { PrivilegedStretchExerciseMuscle } from '../src/models/stretchExerciseMuscle'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Stretch Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStretchExercise: PrivilegedStretchExercise
  let createdStretchExerciseMuscle: PrivilegedStretchExerciseMuscle

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    createdStretchExercise = await adminSession.createStretchExercise({
      defaultExerciseAlias: randomCharacterSequence(16)
    })
  })

  after(async function () {
    await createdStretchExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create stretch exercise muscle', async function () {
    const stretchExerciseMuscleParams = {
      muscle: MuscleIdentifier.Deltoid,
      targetLevel: MuscleTargetLevel.Primary
    }
    const stretchExerciseMuscle = await createdStretchExercise.createStretchExerciseMuscle(stretchExerciseMuscleParams)

    expect(stretchExerciseMuscle).to.be.an('object')
    expect(stretchExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
    expect(stretchExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    createdStretchExerciseMuscle = stretchExerciseMuscle
  })

  it('can reload stretch exercise muscle', async function () {
    expect(createdStretchExerciseMuscle).to.be.an('object')
    if (typeof createdStretchExerciseMuscle !== 'undefined') {
      await createdStretchExerciseMuscle.reload()
      expect(createdStretchExerciseMuscle).to.be.an('object')
      expect(createdStretchExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdStretchExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can list stretch exercise muscles', async function () {
    const stretchExerciseMuscles = await createdStretchExercise.getStretchExerciseMuscles()

    expect(Array.isArray(stretchExerciseMuscles)).to.equal(true)
    expect(stretchExerciseMuscles.length).to.be.above(0)
    expect(stretchExerciseMuscles.meta.sort).to.equal(MuscleSorting.ID)
  })

  it('can get specific stretch exercise muscle', async function () {
    expect(createdStretchExerciseMuscle).to.be.an('object')
    if (typeof createdStretchExerciseMuscle !== 'undefined') {
      const stretchExerciseMuscle = await userSession.getStretchExerciseMuscle({ id: createdStretchExerciseMuscle.id })

      expect(stretchExerciseMuscle).to.be.an('object')
      expect(stretchExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(stretchExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Primary)
    }
  })

  it('can update stretch exercise muscle', async function () {
    if (typeof createdStretchExerciseMuscle !== 'undefined') {
      const stretchExerciseMuscleParams = {
        targetLevel: MuscleTargetLevel.Stabilizer
      }
      await createdStretchExerciseMuscle.update(stretchExerciseMuscleParams)
      expect(createdStretchExerciseMuscle).to.be.an('object')
      expect(createdStretchExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdStretchExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Stabilizer)
    }
  })

  it('can delete exercise', async function () {
    if (typeof createdStretchExerciseMuscle !== 'undefined') {
      let extError

      await createdStretchExerciseMuscle.delete()

      try {
        await createdStretchExerciseMuscle.reload()
      } catch (error: any) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError?.code).to.equal(UnknownEntityError.code)
    }
  })
})
