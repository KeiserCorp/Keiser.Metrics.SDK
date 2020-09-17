import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { Exercise } from '../src/models/exercise'
import { ExerciseLaterality, ExerciseMovement, ExercisePlane, ExerciseVariant, ExerciseVariantSorting, ExerciseVariantType } from '../src/models/exerciseVariant'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Exercise Variant', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let existingExercise: Exercise
  let newExerciseVariant: ExerciseVariant

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
    existingExercise = (await userSession.getExercises({ limit: 1 }))[0]
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create exercise variant', async function () {
    const exerciseVariantParams = {
      exerciseId: existingExercise.id,
      variant: ExerciseVariantType.Normal,
      laterality: ExerciseLaterality.Combination,
      movement: ExerciseMovement.Compound,
      plane: ExercisePlane.Frontal
    }
    const exerciseVariant = await adminSession.createExerciseVariant(exerciseVariantParams)

    expect(exerciseVariant).to.be.an('object')
    expect(exerciseVariant.exercise).to.be.an('object')
    expect(exerciseVariant.variant).to.equal(ExerciseVariantType.Normal)
    expect(exerciseVariant.laterality).to.equal(ExerciseLaterality.Combination)
    expect(exerciseVariant.movement).to.equal(ExerciseMovement.Compound)
    expect(exerciseVariant.plane).to.equal(ExercisePlane.Frontal)
    newExerciseVariant = exerciseVariant
  })

  it('can list available exercise variants', async function () {
    const exerciseVariants = await userSession.getExerciseVariants()

    expect(Array.isArray(exerciseVariants)).to.equal(true)
    expect(exerciseVariants.length).to.be.above(0)
    expect(exerciseVariants.meta.sort).to.equal(ExerciseVariantSorting.ID)
  })

  it('can reload exercise variant', async function () {
    expect(newExerciseVariant).to.be.an('object')
    if (typeof newExerciseVariant !== 'undefined') {
      await newExerciseVariant.reload()
      expect(newExerciseVariant).to.be.an('object')
      expect(newExerciseVariant.variant).to.equal(ExerciseVariantType.Normal)
      expect(newExerciseVariant.laterality).to.equal(ExerciseLaterality.Combination)
      expect(newExerciseVariant.movement).to.equal(ExerciseMovement.Compound)
      expect(newExerciseVariant.plane).to.equal(ExercisePlane.Frontal)
    }
  })

  it('can get specific exercise variant', async function () {
    expect(newExerciseVariant).to.be.an('object')
    if (typeof newExerciseVariant !== 'undefined') {
      const exerciseVariant = await userSession.getExerciseVariant({ id: newExerciseVariant.id })

      expect(exerciseVariant).to.be.an('object')
      expect(exerciseVariant.id).to.equal(newExerciseVariant.id)
      expect(exerciseVariant.variant).to.equal(ExerciseVariantType.Normal)
      expect(exerciseVariant.laterality).to.equal(ExerciseLaterality.Combination)
      expect(exerciseVariant.movement).to.equal(ExerciseMovement.Compound)
      expect(exerciseVariant.plane).to.equal(ExercisePlane.Frontal)
    }
  })

  it('can list exercise variants with privileges', async function () {
    const exerciseVariants = await adminSession.getExerciseVariants()

    expect(Array.isArray(exerciseVariants)).to.equal(true)
    expect(exerciseVariants.length).to.be.above(0)
    expect(exerciseVariants.meta.sort).to.equal(ExerciseVariantSorting.ID)
    expect(typeof exerciseVariants[0].update).to.equal('function')
  })

  it('can update exercise variant', async function () {
    if (typeof newExerciseVariant !== 'undefined') {
      const exerciseVariant = await adminSession.getExerciseVariant({ id: newExerciseVariant.id })
      const exerciseVariantParams = {
        exerciseId: existingExercise.id,
        variant: ExerciseVariantType.Alternate,
        laterality: ExerciseLaterality.Combination,
        movement: ExerciseMovement.Compound,
        plane: ExercisePlane.Frontal
      }
      await exerciseVariant.update(exerciseVariantParams)
      expect(exerciseVariant).to.be.an('object')
      expect(exerciseVariant.variant).to.equal(ExerciseVariantType.Alternate)
      expect(exerciseVariant.laterality).to.equal(ExerciseLaterality.Combination)
      expect(exerciseVariant.movement).to.equal(ExerciseMovement.Compound)
      expect(exerciseVariant.plane).to.equal(ExercisePlane.Frontal)
    }
  })

  it('can delete exercise', async function () {
    let extError

    const exerciseVariant = await adminSession.getExerciseVariant({ id: newExerciseVariant.id })
    await exerciseVariant.delete()

    try {
      await exerciseVariant.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
