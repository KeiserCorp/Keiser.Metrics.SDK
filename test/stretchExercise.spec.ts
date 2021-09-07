import { expect } from 'chai'

import MetricsAdmin, { AdminSession } from '../src/admin'
import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { PrivilegedStretchExercise, StretchExerciseSorting } from '../src/models/stretchExercise'
import { UserSession } from '../src/session'
import MetricsSSO from '../src/sso'
import { randomCharacterSequence } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Stretch Exercise', function () {
  const newExerciseName = randomCharacterSequence(16)

  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let metricsSSOInstance: MetricsSSO
  let userSession: UserSession
  let adminSession: AdminSession
  let createdStretchExercise: PrivilegedStretchExercise

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    metricsSSOInstance = getMetricsSSOInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })
  })

  after(async function () {
    metricsInstance?.dispose()
    metricsSSOInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can create stretch exercise', async function () {
    const stretchExerciseParams = {
      defaultExerciseAlias: newExerciseName
    }
    const stretchExercise = await adminSession.createStretchExercise(stretchExerciseParams)

    expect(stretchExercise).to.be.an('object')
    const defaultExerciseAlias = stretchExercise.eagerDefaultExerciseAlias()
    expect(defaultExerciseAlias).to.be.an('object')
    expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    createdStretchExercise = stretchExercise
  })

  it('can list available stretch exercises', async function () {
    const stretchExercises = await userSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
  })

  it('can reload stretch exercise', async function () {
    expect(createdStretchExercise).to.be.an('object')
    if (typeof createdStretchExercise !== 'undefined') {
      await createdStretchExercise.reload()
      expect(createdStretchExercise).to.be.an('object')
      const defaultExerciseAlias = createdStretchExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can get specific stretch exercise', async function () {
    expect(createdStretchExercise).to.be.an('object')
    if (typeof createdStretchExercise !== 'undefined') {
      const stretchExercise = await userSession.getStretchExercise({ id: createdStretchExercise.id })
      const defaultExerciseAlias = stretchExercise.eagerDefaultExerciseAlias()
      expect(defaultExerciseAlias).to.be.an('object')
      expect(defaultExerciseAlias.alias).to.equal(newExerciseName)
    }
  })

  it('can list stretch exercises with privileges', async function () {
    const stretchExercises = await adminSession.getStretchExercises()

    expect(Array.isArray(stretchExercises)).to.equal(true)
    expect(stretchExercises.length).to.be.above(0)
    expect(stretchExercises.meta.sort).to.equal(StretchExerciseSorting.ID)
    expect(typeof stretchExercises[0].delete).to.equal('function')
  })

  it('can delete exercise', async function () {
    let extError

    const stretchExercise = await adminSession.getStretchExercise({ id: createdStretchExercise.id })
    await stretchExercise.delete()

    try {
      await stretchExercise.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
