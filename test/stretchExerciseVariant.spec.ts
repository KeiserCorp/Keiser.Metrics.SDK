import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedStretchExercise } from '../src/models/stretchExercise'
import { PrivilegedStretchExerciseVariant, StretchExerciseVariantSorting, StretchExerciseVariantType } from '../src/models/stretchExerciseVariant'
import { AdminSession, UserSession } from '../src/session'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Stretch Exercise Variant', function () {
  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStretchExercise: PrivilegedStretchExercise
  let createdStretchExerciseVariant: PrivilegedStretchExerciseVariant

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })

    createdStretchExercise = await adminSession.createStretchExercise({ defaultExerciseAlias: randomCharacterSequence(16) })
  })

  after(async function () {
    await createdStretchExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
  })

  it('can create stretch exercise variants', async function () {
    const stretchExerciseVariant = await createdStretchExercise.createStretchExerciseVariant({ variant: StretchExerciseVariantType.Normal })

    expect(stretchExerciseVariant).to.be.an('object')
    expect(stretchExerciseVariant.variant).to.equal(StretchExerciseVariantType.Normal)
    expect(stretchExerciseVariant.instructionalImage).to.equal(null)
    expect(stretchExerciseVariant.instructionalVideo).to.equal(null)
    createdStretchExerciseVariant = stretchExerciseVariant
  })

  it('can reload stretch exercise variants', async function () {
    await createdStretchExerciseVariant.reload()
    expect(createdStretchExerciseVariant).to.be.an('object')
  })

  it('can list stretch exercise variants', async function () {
    const stretchExerciseVariants = await createdStretchExercise.getStretchExerciseVariants()

    expect(Array.isArray(stretchExerciseVariants)).to.equal(true)
    expect(stretchExerciseVariants.length).to.be.above(0)
    expect(stretchExerciseVariants.meta.sort).to.equal(StretchExerciseVariantSorting.ID)
  })

  it('can get specific stretch exercise variants', async function () {
    expect(createdStretchExerciseVariant).to.be.an('object')
    const stretchExerciseVariant = await userSession.getStretchExerciseVariant({ id: createdStretchExerciseVariant.id })

    expect(stretchExerciseVariant).to.be.an('object')
    expect(stretchExerciseVariant.variant).to.equal(StretchExerciseVariantType.Normal)
    expect(stretchExerciseVariant.instructionalImage).to.equal(null)
    expect(stretchExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can update stretch exercise variants', async function () {
    await createdStretchExerciseVariant.update({
      variant: StretchExerciseVariantType.Normal,
      instructionalImage: 'https://cdn.keiser.com/test.png',
      instructionalVideo: 'https://cdn.keiser.com/test.avi'
    })

    expect(createdStretchExerciseVariant).to.be.an('object')
    expect(createdStretchExerciseVariant.variant).to.equal(StretchExerciseVariantType.Normal)
    expect(createdStretchExerciseVariant.instructionalImage).to.equal('https://cdn.keiser.com/test.png')
    expect(createdStretchExerciseVariant.instructionalVideo).to.equal('https://cdn.keiser.com/test.avi')
  })

  it('can update stretch exercise variants again (null states)', async function () {
    await createdStretchExerciseVariant.update({
      variant: StretchExerciseVariantType.Normal,
      instructionalVideo: null
    })

    expect(createdStretchExerciseVariant).to.be.an('object')
    expect(createdStretchExerciseVariant.variant).to.equal(StretchExerciseVariantType.Normal)
    expect(createdStretchExerciseVariant.instructionalImage).to.equal(null)
    expect(createdStretchExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can delete stretch exercise variants', async function () {
    let extError

    await createdStretchExerciseVariant.delete()

    try {
      await createdStretchExerciseVariant.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
