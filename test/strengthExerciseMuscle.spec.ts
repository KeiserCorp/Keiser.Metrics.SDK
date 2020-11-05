import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseMuscle } from '../src/models/strengthExerciseMuscle'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Strength Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseMuscle: PrivilegedStrengthExerciseMuscle

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
    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: newNameGen(),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovement.Compound,
      plane: StrengthExercisePlane.Sagittal
    })
  })

  after(async function () {
    await createdStrengthExercise.delete()
    metricsInstance?.dispose()
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
