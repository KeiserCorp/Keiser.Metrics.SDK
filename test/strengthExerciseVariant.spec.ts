import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExerciseMovementDEP, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseVariant, StrengthExerciseVariantAttachment, StrengthExerciseVariantSorting, StrengthExerciseVariantType } from '../src/models/strengthExerciseVariant'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Strength Exercise Variant', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseVariant: PrivilegedStrengthExerciseVariant

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: randomCharacterSequence(26),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovementDEP.Compound,
      plane: StrengthExercisePlane.Sagittal,
      humanMovement: StrengthExerciseMovement.Bilateral
    })
  })

  after(async function () {
    await createdStrengthExercise.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create strength exercise variants', async function () {
    const strengthExerciseVariant = await createdStrengthExercise.createStrengthExerciseVariant({
      variant: StrengthExerciseVariantType.Normal,
      attachment: StrengthExerciseVariantAttachment.Bar,
      equipmentMechanicalMovement: StrengthExerciseMovement.Bilateral
    })

    expect(strengthExerciseVariant).to.be.an('object')
    expect(strengthExerciseVariant.variant).to.equal(StrengthExerciseVariantType.Normal)
    expect(strengthExerciseVariant.attachment).to.equal(StrengthExerciseVariantAttachment.Bar)
    expect(strengthExerciseVariant.instructionalImage).to.equal(null)
    expect(strengthExerciseVariant.instructionalVideo).to.equal(null)
    createdStrengthExerciseVariant = strengthExerciseVariant
  })

  it('can reload strength exercise variants', async function () {
    await createdStrengthExerciseVariant.reload()
    expect(createdStrengthExerciseVariant).to.be.an('object')
  })

  it('can list strength exercise variants', async function () {
    const strengthExerciseVariants = await createdStrengthExercise.getStrengthExerciseVariants()

    expect(Array.isArray(strengthExerciseVariants)).to.equal(true)
    expect(strengthExerciseVariants.length).to.be.above(0)
    expect(strengthExerciseVariants.meta.sort).to.equal(StrengthExerciseVariantSorting.ID)
  })

  it('can get specific strength exercise variants', async function () {
    expect(createdStrengthExerciseVariant).to.be.an('object')
    const strengthExerciseVariant = await userSession.getStrengthExerciseVariant({ id: createdStrengthExerciseVariant.id })

    expect(strengthExerciseVariant).to.be.an('object')
    expect(strengthExerciseVariant.variant).to.equal(StrengthExerciseVariantType.Normal)
    expect(strengthExerciseVariant.attachment).to.equal(StrengthExerciseVariantAttachment.Bar)
    expect(strengthExerciseVariant.instructionalImage).to.equal(null)
    expect(strengthExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can update strength exercise variants', async function () {
    await createdStrengthExerciseVariant.update({
      variant: StrengthExerciseVariantType.Alternate,
      equipmentMechanicalMovement: StrengthExerciseMovement.Bilateral,
      instructionalImage: 'https://cdn.keiser.com/test.png',
      instructionalVideo: 'https://cdn.keiser.com/test.avi'
    })

    expect(createdStrengthExerciseVariant).to.be.an('object')
    expect(createdStrengthExerciseVariant.variant).to.equal(StrengthExerciseVariantType.Alternate)
    expect(createdStrengthExerciseVariant.attachment).to.equal(null)
    expect(createdStrengthExerciseVariant.instructionalImage).to.equal('https://cdn.keiser.com/test.png')
    expect(createdStrengthExerciseVariant.instructionalVideo).to.equal('https://cdn.keiser.com/test.avi')
  })

  it('can update strength exercise variants again (null states)', async function () {
    await createdStrengthExerciseVariant.update({
      variant: StrengthExerciseVariantType.Normal,
      equipmentMechanicalMovement: StrengthExerciseMovement.Bilateral,
      instructionalVideo: null
    })

    expect(createdStrengthExerciseVariant).to.be.an('object')
    expect(createdStrengthExerciseVariant.variant).to.equal(StrengthExerciseVariantType.Normal)
    expect(createdStrengthExerciseVariant.instructionalImage).to.equal(null)
    expect(createdStrengthExerciseVariant.instructionalVideo).to.equal(null)
  })

  it('can delete strength exercise variants', async function () {
    let extError

    await createdStrengthExerciseVariant.delete()

    try {
      await createdStrengthExerciseVariant.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
