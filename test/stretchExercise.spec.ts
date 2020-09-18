import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { ExerciseLaterality, ExerciseMovement, ExercisePlane, ExerciseVariantType, PrivilegedExerciseVariant } from '../src/models/exerciseVariant'
import { StretchExercise, StretchExerciseSorting } from '../src/models/stretchExercise'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Stretch Exercise', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let existingExerciseVariant: PrivilegedExerciseVariant
  let newStretchExercise: StretchExercise

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
    const existingExercise = (await userSession.getExercises({ limit: 1 }))[0]
    const exerciseVariantParams = {
      exerciseId: existingExercise.id,
      variant: ExerciseVariantType.Normal,
      laterality: ExerciseLaterality.Combination,
      movement: ExerciseMovement.Compound,
      plane: ExercisePlane.Frontal
    }
    existingExerciseVariant = await adminSession.createExerciseVariant(exerciseVariantParams)
  })

  after(async function () {
    await existingExerciseVariant.delete()
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create stretch exercise', async function () {
    const stretchExerciseParams = {
      exerciseVariantId: existingExerciseVariant.id,
      imageUri: 'http://static.keiser.com/img1.png',
      instructionalVideoUri: 'http://static.keiser.com/mov1.avi'
    }
    const stretchExercise = await adminSession.createStretchExercise(stretchExerciseParams)

    expect(stretchExercise).to.be.an('object')
    expect(stretchExercise.exerciseVariant).to.be.an('object')
    expect(stretchExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
    expect(stretchExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    newStretchExercise = stretchExercise
  })

  it('can list available stretch exercises', async function () {
    const stretchExercises = await userSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
  })

  it('can reload stretch exercise', async function () {
    expect(newStretchExercise).to.be.an('object')
    if (typeof newStretchExercise !== 'undefined') {
      await newStretchExercise.reload()
      expect(newStretchExercise).to.be.an('object')
      expect(newStretchExercise.exerciseVariant).to.be.an('object')
      expect(newStretchExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
      expect(newStretchExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    }
  })

  it('can get specific stretch exercise', async function () {
    expect(newStretchExercise).to.be.an('object')
    if (typeof newStretchExercise !== 'undefined') {
      const stretchExercise = await userSession.getStretchExercise({ id: newStretchExercise.id })

      expect(stretchExercise).to.be.an('object')
      expect(stretchExercise.exerciseVariant).to.be.an('object')
      expect(stretchExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
      expect(stretchExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    }
  })

  it('can list stretch exercises with privileges', async function () {
    const stretchExercises = await adminSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
    expect(typeof stretchExercises[0].update).to.equal('function')
  })

  it('can update stretch exercise', async function () {
    if (typeof newStretchExercise !== 'undefined') {
      const stretchExercise = await adminSession.getStretchExercise({ id: newStretchExercise.id })
      const stretchExerciseParams = {
        imageUri: 'http://static.keiser.com/img2.png',
        instructionalVideoUri: 'http://static.keiser.com/mov2.avi'
      }
      await stretchExercise.update(stretchExerciseParams)
      expect(stretchExercise).to.be.an('object')
      expect(stretchExercise.exerciseVariant).to.be.an('object')
      expect(stretchExercise.imageUri).to.equal('http://static.keiser.com/img2.png')
      expect(stretchExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov2.avi')
    }
  })

  it('can delete exercise', async function () {
    let extError

    const stretchExercise = await adminSession.getStretchExercise({ id: newStretchExercise.id })
    await stretchExercise.delete()

    try {
      await stretchExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
