import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from '../src/models/muscle'
import { PrivilegedStretchExercise } from '../src/models/stretchExercise'
import { PrivilegedStretchExerciseMuscle } from '../src/models/stretchExerciseMuscle'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Stretch Exercise Muscle', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStretchExercise: PrivilegedStretchExercise
  let createdStretchExerciseMuscle: PrivilegedStretchExerciseMuscle

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
    createdStretchExercise = await adminSession.createStretchExercise({
      defaultExerciseAlias: newNameGen()
    })
  })

  after(async function () {
    await createdStretchExercise.delete()
    metricsInstance?.dispose()
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
      } catch (error) {
        extError = error
      }

      expect(extError).to.be.an('error')
      expect(extError.code).to.equal(UnknownEntityError.code)
    }
  })

})
