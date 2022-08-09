import { expect } from 'chai'

import { ForceUnit } from '../src/constants'
import Metrics from '../src/core'
import { ResistancePrecision } from '../src/models/strengthMachineDataSet'
import { StrengthMachineProfileStats } from '../src/models/strengthMachineProfileStats'
import { User } from '../src/models/user'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Strength Machine Profile Stats', function () {
  let metricsInstance: Metrics
  let user: User
  let createdStrengthMachineProfileStats: StrengthMachineProfileStats

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    user = demoUserSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get a user\'s Strength Machine Profile Stats', async function () {
    await user.createStrengthMachineDataSet({
      strengthMachineId: 1001,
      version: '3EC8495T',
      serial: '1124 1013 1858 1743',
      completedAt: new Date(),
      chest: 1,
      rom1: 2,
      rom2: 3,
      seat: 4,
      resistance: 100,
      resistancePrecision: ResistancePrecision.Integer,
      repetitionCount: 12,
      forceUnit: ForceUnit.Pounds,
      peakPower: 1111,
      work: 2.3
    })

    await user.createStrengthMachineDataSet({
      strengthMachineId: 1001,
      version: '3EC8495C',
      serial: '0121 2011 0851 4741',
      completedAt: new Date(),
      chest: 2,
      rom1: 3,
      rom2: 1,
      seat: 3,
      resistance: 200,
      resistancePrecision: ResistancePrecision.Integer,
      repetitionCount: 5,
      forceUnit: ForceUnit.Pounds,
      peakPower: 5555,
      work: 9.1
    })

    const strengthMachineProfileStats = await user.getStrengthMachineProfileStats({ strengthMachineId: 1001 })

    expect(typeof strengthMachineProfileStats).to.equal('object')
    expect(strengthMachineProfileStats.peakPower).to.equal(5555)
    createdStrengthMachineProfileStats = strengthMachineProfileStats
  })

  it('can reload Strength Machine Profile Stats', async function () {
    const strengthMachineProfileStats = await createdStrengthMachineProfileStats.reload()

    expect(typeof strengthMachineProfileStats).to.equal('object')
    expect(strengthMachineProfileStats.peakPower).to.equal(5555)
  })
})
