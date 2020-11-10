import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { ForceUnit, ResistancePrecision, StrengthMachineDataSet, StrengthMachineDataSetSorting } from '../src/models/strengthMachineDataSet'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Strength Machine Data Set', function () {
  let metricsInstance: Metrics
  let user: User
  let createdStrengthMachineDataSet: StrengthMachineDataSet

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
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
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
