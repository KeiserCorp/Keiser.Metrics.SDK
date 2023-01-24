import { expect } from 'chai'

import { ForceUnit } from '../src/constants'
import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { ResistancePrecision, StrengthMachineDataSet, StrengthMachineDataSetSorting } from '../src/models/strengthMachineDataSet'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Strength Machine Data Set', function () {
  let metricsInstance: Metrics
  let user: User
  let createdStrengthMachineDataSet: StrengthMachineDataSet

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    user = demoUserSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list Strength Machine data set', async function () {
    const strengthMachineDataSets = await user.getStrengthMachineDataSets()

    expect(Array.isArray(strengthMachineDataSets)).to.equal(true)
    expect(strengthMachineDataSets.meta.sort).to.equal(StrengthMachineDataSetSorting.CompletedAt)
  })

  it('can create new Strength Machine data set', async function () {
    const strengthMachineDataSet = await user.createStrengthMachineDataSet({
      strengthMachineId: 1000,
      version: '3EC8495A',
      serial: '0124 2013 0858 4743',
      completedAt: new Date(),
      chest: 1,
      rom1: 2,
      rom2: 3,
      seat: 4,
      resistance: 100,
      resistancePrecision: ResistancePrecision.Integer,
      repetitionCount: 12,
      forceUnit: ForceUnit.Pounds,
      peakPower: 1234,
      work: 2.3
    })

    expect(typeof strengthMachineDataSet).to.equal('object')
    expect(strengthMachineDataSet.repetitionCount).to.equal(12)
    createdStrengthMachineDataSet = strengthMachineDataSet
  })

  it('can reload Strength Machine data set', async function () {
    const strengthMachineDataSet = await createdStrengthMachineDataSet.reload()

    expect(typeof strengthMachineDataSet).to.equal('object')
    expect(strengthMachineDataSet.repetitionCount).to.equal(12)
  })

  it('can get specific Strength Machine data set', async function () {
    const strengthMachineDataSet = await user.getStrengthMachineDataSet({ id: createdStrengthMachineDataSet.id })

    expect(typeof strengthMachineDataSet).to.equal('object')
    expect(strengthMachineDataSet.id).to.equal(createdStrengthMachineDataSet.id)
    expect(strengthMachineDataSet.repetitionCount).to.equal(createdStrengthMachineDataSet.repetitionCount)
  })

  it('can delete Strength Machine data set', async function () {
    await createdStrengthMachineDataSet.delete()

    let extError

    try {
      await createdStrengthMachineDataSet.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can subscribe to Strength Machine data set changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const strengthMachineDataSet = await user.createStrengthMachineDataSet({
      strengthMachineId: 1000,
      version: '3EC8495A',
      serial: '0124 2013 0858 4743',
      completedAt: new Date(),
      chest: 1,
      rom1: 2,
      rom2: 3,
      seat: 4,
      resistance: 100,
      resistancePrecision: ResistancePrecision.Integer,
      repetitionCount: 12,
      forceUnit: ForceUnit.Pounds,
      peakPower: 1234,
      work: 2.3
    })

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = strengthMachineDataSet.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'delete' && e.id === strengthMachineDataSet.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await strengthMachineDataSet.delete()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('delete')
    expect(modelChangeEvent.id).to.equal(strengthMachineDataSet.id)
  })

  it('can subscribe to Strength Machine data set list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const strengthMachineDataSets = await user.getStrengthMachineDataSets({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = strengthMachineDataSets.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (strengthMachineDataSets.length === 0 || e.id !== strengthMachineDataSets[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const strengthMachineDataSet = await user.createStrengthMachineDataSet({
      strengthMachineId: 1000,
      version: '3EC8495A',
      serial: '0124 2013 0858 4743',
      completedAt: new Date(),
      chest: 1,
      rom1: 2,
      rom2: 3,
      seat: 4,
      resistance: 100,
      resistancePrecision: ResistancePrecision.Integer,
      repetitionCount: 12,
      forceUnit: ForceUnit.Pounds,
      peakPower: 1234,
      work: 2.3
    })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(strengthMachineDataSet.id)

    await strengthMachineDataSet.delete()
  })
})
