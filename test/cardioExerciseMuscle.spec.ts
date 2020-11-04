import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedCardioExercise } from '../src/models/cardioExercise'
import { MuscleIdentifier, MuscleTargetLevel, PrivilegedCardioExerciseMuscle } from '../src/models/muscle'
import { AdminSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Cardio Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let adminSession: AdminSession
  let createdCardioExercise: PrivilegedCardioExercise
  let createdCardioExerciseMuscle: PrivilegedCardioExerciseMuscle

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
    adminSession = await metricsAdminInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
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

  it('can get specific cardio exercise muscle', async function () {
    expect(createdCardioExerciseMuscle).to.be.an('object')
    if (typeof createdCardioExerciseMuscle !== 'undefined') {
      const cardioExerciseMuscle = await createdCardioExercise.getCardioExerciseMuscle({ id: createdCardioExerciseMuscle.id })

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
