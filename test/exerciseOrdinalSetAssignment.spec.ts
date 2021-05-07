import { expect } from 'chai'

import { MetricsAdmin, MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedExerciseOrdinalSet } from '../src/models/exerciseOrdinalSet'
import { ExerciseOrdinalSetAssignmentSorting, PrivilegedExerciseOrdinalSetAssignment } from '../src/models/exerciseOrdinalSetAssignment'
import { PrivilegedStrengthExercise, StrengthExerciseCategory, StrengthExerciseMovement, StrengthExercisePlane } from '../src/models/strengthExercise'
import { PrivilegedStrengthExerciseVariant, StrengthExerciseVariantAttachment, StrengthExerciseVariantType } from '../src/models/strengthExerciseVariant'
import { AdminSession, UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser, AuthenticatedUser } from './persistent/user'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
const newCodeGen = () => [...Array(6)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
const newIdentifier = () => [...Array(6)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Exercise Ordinal Set Assignment', function () {
  let metricsInstance: MetricsSSO
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdExerciseOrdinalSet: PrivilegedExerciseOrdinalSet
  let createdStrengthExercise: PrivilegedStrengthExercise
  let createdStrengthExerciseVariant: PrivilegedStrengthExerciseVariant
  let createdExerciseOrdinalSetAssignment: PrivilegedExerciseOrdinalSetAssignment
  const identifier = newIdentifier()

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
    adminSession = await AdminUser(metricsAdminInstance)
    createdExerciseOrdinalSet = await adminSession.createExerciseOrdinalSet({ code: newCodeGen(), name: newNameGen(), description: 'test' })
    createdStrengthExercise = await adminSession.createStrengthExercise({
      defaultExerciseAlias: newNameGen(),
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
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
