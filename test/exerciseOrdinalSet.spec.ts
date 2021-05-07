import { expect } from 'chai'

import { MetricsAdmin, MetricsSSO } from '../src'
import { UnknownEntityError } from '../src/error'
import { ExerciseOrdinalSetSorting, PrivilegedExerciseOrdinalSet } from '../src/models/exerciseOrdinalSet'
import { AdminSession, UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser, AuthenticatedUser } from './persistent/user'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
const newCodeGen = () => [...Array(6)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Exercise Ordinal Set', function () {
  let metricsInstance: MetricsSSO
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let createdExerciseOrdinalSet: PrivilegedExerciseOrdinalSet
  const newName = newNameGen()
  const newCode = newCodeGen()

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
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
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
    const newerName = newNameGen()
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
