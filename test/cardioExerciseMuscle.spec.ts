import { expect } from 'chai'

import { MetricsAdmin, MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedCardioExercise } from '../src/models/cardioExercise'
import { PrivilegedCardioExerciseMuscle } from '../src/models/cardioExerciseMuscle'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { AdminSession, UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser, AuthenticatedUser } from './persistent/user'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Cardio Exercise Muscle', function () {
  let metricsInstance: MetricsSSO
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdCardioExercise: PrivilegedCardioExercise
  let createdCardioExerciseMuscle: PrivilegedCardioExerciseMuscle

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
    adminSession = await AdminUser(metricsAdminInstance)
    createdCardioExercise = await adminSession.createCardioExercise({
      defaultExerciseAlias: newNameGen()
    })
  })

  after(async function () {
    await createdCardioExercise.delete()
    metricsInstance?.dispose()
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
        targetLevel: MuscleTargetLevel.Stabilizer
      }
      await createdCardioExerciseMuscle.update(cardioExerciseMuscleParams)
      expect(createdCardioExerciseMuscle).to.be.an('object')
      expect(createdCardioExerciseMuscle.muscle).to.equal(MuscleIdentifier.Deltoid)
      expect(createdCardioExerciseMuscle.targetLevel).to.equal(MuscleTargetLevel.Stabilizer)
    }
  })

  it('can delete exercise', async function () {
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      let extError

      await createdCardioExerciseMuscle.delete()

      try {
        await createdCardioExerciseMuscle.reload()
      } catch (error) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError.code).to.equal(UnknownEntityError.code)
    }
  })
})
