import { expect } from 'chai'

import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedCardioExercise } from '../src/models/cardioExercise'
import { CardioExerciseVariantSorting, CardioExerciseVariantType, PrivilegedCardioExerciseVariant } from '../src/models/cardioExerciseVariant'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Cardio Exercise Variant', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdCardioExercise: PrivilegedCardioExercise
  let createdCardioExerciseVariant: PrivilegedCardioExerciseVariant

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
    createdCardioExercise = await adminSession.createCardioExercise({ defaultExerciseAlias: newNameGen() })
  })

  after(async function () {
    await createdCardioExercise.delete()
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create cardio exercise variants', async function () {
    const cardioExerciseVariant = await createdCardioExercise.createCardioExerciseVariant({ variant: CardioExerciseVariantType.Normal })

    expect(cardioExerciseVariant).to.be.an('object')
    expect(cardioExerciseVariant.variant).to.equal(CardioExerciseVariantType.Normal)
    expect(cardioExerciseVariant.instructionalImage).to.equal(null)
    expect(cardioExerciseVariant.instructionalVideo).to.equal(null)
    createdCardioExerciseVariant = cardioExerciseVariant
  })

  it('can reload cardio exercise variants', async function () {
    await createdCardioExerciseVariant.reload()
    expect(createdCardioExerciseVariant).to.be.an('object')
  })

  it('can list cardio exercise variants', async function () {
    const cardioExerciseVariants = await createdCardioExercise.getCardioExerciseVariants()

    expect(Array.isArray(cardioExerciseVariants)).to.equal(true)
    expect(cardioExerciseVariants.length).to.be.above(0)
    expect(cardioExerciseVariants.meta.sort).to.equal(CardioExerciseVariantSorting.ID)
  })

  it('can get specific cardio exercise variants', async function () {
    expect(createdCardioExerciseVariant).to.be.an('object')
    const cardioExerciseVariant = await userSession.getCardioExerciseVariant({ id: createdCardioExerciseVariant.id })

    expect(cardioExerciseVariant).to.be.an('object')
    expect(cardioExerciseVariant.variant).to.equal(CardioExerciseVariantType.Normal)
    expect(cardioExerciseVariant.instructionalImage).to.equal(null)
    expect(cardioExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can update cardio exercise variants', async function () {
    await createdCardioExerciseVariant.update({
      variant: CardioExerciseVariantType.Normal,
      instructionalImage: 'https://cdn.keiser.com/test.png',
      instructionalVideo: 'https://cdn.keiser.com/test.avi'
    })

    expect(createdCardioExerciseVariant).to.be.an('object')
    expect(createdCardioExerciseVariant.variant).to.equal(CardioExerciseVariantType.Normal)
    expect(createdCardioExerciseVariant.instructionalImage).to.equal('https://cdn.keiser.com/test.png')
    expect(createdCardioExerciseVariant.instructionalVideo).to.equal('https://cdn.keiser.com/test.avi')
  })

  it('can update cardio exercise variants again (null states)', async function () {
    await createdCardioExerciseVariant.update({
      variant: CardioExerciseVariantType.Normal,
      instructionalVideo: null
    })

    expect(createdCardioExerciseVariant).to.be.an('object')
    expect(createdCardioExerciseVariant.variant).to.equal(CardioExerciseVariantType.Normal)
    expect(createdCardioExerciseVariant.instructionalImage).to.equal(null)
    expect(createdCardioExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can delete cardio exercise variants', async function () {
    let extError

    await createdCardioExerciseVariant.delete()

    try {
      await createdCardioExerciseVariant.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
