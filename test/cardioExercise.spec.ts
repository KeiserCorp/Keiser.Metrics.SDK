import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { CardioExercise, CardioExerciseSorting } from '../src/models/cardioExercise'
import { CardioMachineLine, CardioMachineParseCode, PrivilegedCardioMachine } from '../src/models/cardioMachine'
import { ExerciseLaterality, ExerciseMovement, ExercisePlane, ExerciseVariantType, PrivilegedExerciseVariant } from '../src/models/exerciseVariant'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Cardio Exercise', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdExerciseVariant: PrivilegedExerciseVariant
  let newCardioExercise: CardioExercise
  let createdCardioMachine: PrivilegedCardioMachine

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
    createdCardioMachine = await adminSession.createCardioMachine({ name: newNameGen(), line: CardioMachineLine.MSeries, parseCode: CardioMachineParseCode.MSeries6 })
    const exerciseVariantParams = {
      exerciseId: existingExercise.id,
      variant: ExerciseVariantType.Normal,
      laterality: ExerciseLaterality.Combination,
      movement: ExerciseMovement.Compound,
      plane: ExercisePlane.Frontal
    }
    createdExerciseVariant = await adminSession.createExerciseVariant(exerciseVariantParams)
  })

  after(async function () {
    await createdExerciseVariant.delete()
    await createdCardioMachine.delete()
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create cardio exercise', async function () {
    const cardioExerciseParams = {
      exerciseVariantId: createdExerciseVariant.id,
      cardioMachineId: createdCardioMachine.id,
      imageUri: 'http://static.keiser.com/img1.png',
      instructionalVideoUri: 'http://static.keiser.com/mov1.avi'
    }
    const cardioExercise = await adminSession.createCardioExercise(cardioExerciseParams)

    expect(cardioExercise).to.be.an('object')
    expect(cardioExercise.exerciseVariant).to.be.an('object')
    expect(cardioExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
    expect(cardioExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    newCardioExercise = cardioExercise
  })

  it('can list available cardio exercises', async function () {
    const cardioExercises = await userSession.getCardioExercises()

    expect(Array.isArray(cardioExercises)).to.equal(true)
    expect(cardioExercises.length).to.be.above(0)
    expect(cardioExercises.meta.sort).to.equal(CardioExerciseSorting.ID)
  })

  it('can reload cardio exercise', async function () {
    expect(newCardioExercise).to.be.an('object')
    if (typeof newCardioExercise !== 'undefined') {
      await newCardioExercise.reload()
      expect(newCardioExercise).to.be.an('object')
      expect(newCardioExercise.exerciseVariant).to.be.an('object')
      expect(newCardioExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
      expect(newCardioExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    }
  })

  it('can get specific cardio exercise', async function () {
    expect(newCardioExercise).to.be.an('object')
    if (typeof newCardioExercise !== 'undefined') {
      const cardioExercise = await userSession.getCardioExercise({ id: newCardioExercise.id })

      expect(cardioExercise).to.be.an('object')
      expect(cardioExercise.exerciseVariant).to.be.an('object')
      expect(cardioExercise.imageUri).to.equal('http://static.keiser.com/img1.png')
      expect(cardioExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov1.avi')
    }
  })

  it('can list cardio exercises with privileges', async function () {
    const cardioExercises = await adminSession.getCardioExercises()

    expect(Array.isArray(cardioExercises)).to.equal(true)
    expect(cardioExercises.length).to.be.above(0)
    expect(cardioExercises.meta.sort).to.equal(CardioExerciseSorting.ID)
    expect(typeof cardioExercises[0].update).to.equal('function')
  })

  it('can update cardio exercise', async function () {
    if (typeof newCardioExercise !== 'undefined') {
      const cardioExercise = await adminSession.getCardioExercise({ id: newCardioExercise.id })
      const cardioExerciseParams = {
        imageUri: 'http://static.keiser.com/img2.png',
        instructionalVideoUri: 'http://static.keiser.com/mov2.avi'
      }
      await cardioExercise.update(cardioExerciseParams)
      expect(cardioExercise).to.be.an('object')
      expect(cardioExercise.exerciseVariant).to.be.an('object')
      expect(cardioExercise.imageUri).to.equal('http://static.keiser.com/img2.png')
      expect(cardioExercise.instructionalVideoUri).to.equal('http://static.keiser.com/mov2.avi')
    }
  })

  it('can delete exercise', async function () {
    let extError

    const cardioExercise = await adminSession.getCardioExercise({ id: newCardioExercise.id })
    await cardioExercise.delete()

    try {
      await cardioExercise.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

})
