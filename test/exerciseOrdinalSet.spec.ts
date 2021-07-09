import { expect } from 'chai'

import Metrics, { MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { ExerciseOrdinalSetSorting, PrivilegedExerciseOrdinalSet } from '../src/models/exerciseOrdinalSet'
import { AdminSession, UserSession } from '../src/session'
import { randomCharacterSequence, randomLetterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Exercise Ordinal Set', function () {
  const newName = randomCharacterSequence(16)
  const newCode = randomLetterSequence(6)

  let metricsInstance: Metrics
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdExerciseOrdinalSet: PrivilegedExerciseOrdinalSet

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
  })

  it('can create exercise ordinal set', async function () {
    const exerciseOrdinalSet = await adminSession.createExerciseOrdinalSet({ code: newCode, name: newName, description: 'test' })

    expect(exerciseOrdinalSet).to.be.an('object')
    expect(exerciseOrdinalSet.code).to.equal(newCode)
    expect(exerciseOrdinalSet.name).to.equal(newName)
    expect(exerciseOrdinalSet.description).to.equal('test')
    createdExerciseOrdinalSet = exerciseOrdinalSet
  })

  it('can reload exercise ordinal set', async function () {
    await createdExerciseOrdinalSet.reload()
    expect(createdExerciseOrdinalSet).to.be.an('object')
    expect(createdExerciseOrdinalSet.code).to.equal(newCode)
    expect(createdExerciseOrdinalSet.name).to.equal(newName)
    expect(createdExerciseOrdinalSet.description).to.equal('test')
  })

  it('can list exercise ordinal sets', async function () {
    const exerciseOrdinalSets = await userSession.getExerciseOrdinalSets()

    expect(Array.isArray(exerciseOrdinalSets)).to.equal(true)
    expect(exerciseOrdinalSets.length).to.be.above(0)
    expect(exerciseOrdinalSets.meta.sort).to.equal(ExerciseOrdinalSetSorting.ID)
  })

  it('can get specific exercise ordinal set', async function () {
    expect(createdExerciseOrdinalSet).to.be.an('object')
    const exerciseOrdinalSet = await userSession.getExerciseOrdinalSet({ id: createdExerciseOrdinalSet.id })

    expect(exerciseOrdinalSet).to.be.an('object')
    expect(exerciseOrdinalSet.id).to.equal(createdExerciseOrdinalSet.id)
    expect(exerciseOrdinalSet.code).to.equal(newCode)
    expect(exerciseOrdinalSet.name).to.equal(newName)
    expect(exerciseOrdinalSet.description).to.equal('test')
  })

  it('can update exercise ordinal set', async function () {
    const newerName = randomCharacterSequence(16)
    await createdExerciseOrdinalSet.update({
      name: newerName,
      description: 'test part 2'
    })

    expect(createdExerciseOrdinalSet).to.be.an('object')
    expect(createdExerciseOrdinalSet.code).to.equal(newCode)
    expect(createdExerciseOrdinalSet.name).to.equal(newerName)
    expect(createdExerciseOrdinalSet.description).to.equal('test part 2')
  })

  it('can delete exercise ordinal set', async function () {
    let extError

    await createdExerciseOrdinalSet.delete()

    try {
      await createdExerciseOrdinalSet.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
