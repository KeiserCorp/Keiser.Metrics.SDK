import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { PrivilegedExerciseOrdinalSet } from '../src/models/exerciseOrdinalSet'
import { ExerciseOrdinalSetAssignmentSorting, PrivilegedExerciseOrdinalSetAssignment } from '../src/models/exerciseOrdinalSetAssignment'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseVariant, StrengthExerciseVariantAttachment, StrengthExerciseVariantType } from '../src/models/strengthExerciseVariant'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence, randomLetterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Exercise Ordinal Set Assignment', function () {
  const identifier = randomCharacterSequence(6)

  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdExerciseOrdinalSet: PrivilegedExerciseOrdinalSet
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseVariant: PrivilegedStrengthExerciseVariant
  let createdExerciseOrdinalSetAssignment: PrivilegedExerciseOrdinalSetAssignment

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })

    createdExerciseOrdinalSet = await adminSession.createExerciseOrdinalSet({ code: randomLetterSequence(6), name: randomCharacterSequence(16), description: 'test' })
    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: randomCharacterSequence(16),
      category: StrengthExerciseCategory.Complex,
      movement: StrengthExerciseMovement.Compound,
      plane: StrengthExercisePlane.Sagittal
    })
    createdStrengthExerciseVariant = await createdStrengthExercise.createStrengthExerciseVariant({
      variant: StrengthExerciseVariantType.Normal,
      attachment: StrengthExerciseVariantAttachment.Bar
    })
  })

  after(async function () {
    await createdStrengthExerciseVariant.delete()
    await createdStrengthExercise.delete()
    await createdExerciseOrdinalSet.delete()
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create exercise ordinal set assignment', async function () {
    const exerciseOrdinalSetAssignment = await createdExerciseOrdinalSet.createExerciseOrdinalSetAssignment({ ordinalIdentifier: identifier, strengthExerciseVariantId: createdStrengthExerciseVariant.id })

    expect(exerciseOrdinalSetAssignment).to.be.an('object')
    expect(exerciseOrdinalSetAssignment.ordinalIdentifier).to.equal(identifier)
    expect(exerciseOrdinalSetAssignment.eagerExerciseOrdinalSet()).to.be.an('object')
    expect(exerciseOrdinalSetAssignment.eagerExerciseOrdinalSet()?.id).to.equal(createdExerciseOrdinalSet.id)
    createdExerciseOrdinalSetAssignment = exerciseOrdinalSetAssignment
  })

  it('can reload exercise ordinal set assignment', async function () {
    await createdExerciseOrdinalSetAssignment.reload()
    expect(createdExerciseOrdinalSetAssignment).to.be.an('object')
    expect(createdExerciseOrdinalSetAssignment.ordinalIdentifier).to.equal(identifier)
    const exerciseOrdinalSet = createdExerciseOrdinalSetAssignment.eagerExerciseOrdinalSet()
    expect(exerciseOrdinalSet).to.be.an('object')
    expect(exerciseOrdinalSet?.id).to.equal(createdExerciseOrdinalSet.id)
  })

  it('can list exercise ordinal set assignments', async function () {
    const exerciseOrdinalSetAssignments = await createdExerciseOrdinalSet.getExerciseOrdinalSetAssignments()

    expect(Array.isArray(exerciseOrdinalSetAssignments)).to.equal(true)
    expect(exerciseOrdinalSetAssignments.length).to.be.above(0)
    expect(exerciseOrdinalSetAssignments.meta.sort).to.equal(ExerciseOrdinalSetAssignmentSorting.ID)
  })

  it('can get specific exercise ordinal set assignment', async function () {
    expect(createdExerciseOrdinalSet).to.be.an('object')
    const exerciseOrdinalSetAssignment = await userSession.getExerciseOrdinalSetAssignment({ id: createdExerciseOrdinalSetAssignment.id })

    expect(exerciseOrdinalSetAssignment).to.be.an('object')
    expect(exerciseOrdinalSetAssignment.id).to.equal(createdExerciseOrdinalSetAssignment.id)
    expect(exerciseOrdinalSetAssignment.ordinalIdentifier).to.equal(identifier)
    const exerciseOrdinalSet = exerciseOrdinalSetAssignment.eagerExerciseOrdinalSet()
    expect(exerciseOrdinalSet).to.be.an('object')
    expect(exerciseOrdinalSet?.id).to.equal(createdExerciseOrdinalSet.id)
  })

  it('can delete exercise ordinal set assignment', async function () {
    let extError

    await createdExerciseOrdinalSetAssignment.delete()

    try {
      await createdExerciseOrdinalSetAssignment.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
