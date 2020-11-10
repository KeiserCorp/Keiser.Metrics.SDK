import { expect } from 'chai'

import Metrics, { MetricsAdmin } from '../src'
import { StrengthMachine, StrengthMachineSorting } from '../src/models/strengthMachine'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Strength Machine', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let existingMachine: StrengthMachine

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    metricsAdminInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
  })

  after(function () {
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can list strength machines', async function () {
    const strengthMachines = await userSession.getStrengthMachines()
    existingMachine = strengthMachines[0]

    expect(Array.isArray(strengthMachines)).to.equal(true)
    expect(strengthMachines.length).to.be.above(0)
    expect(strengthMachines.meta.sort).to.equal(StrengthMachineSorting.ID)
  })

  it('can reload strength machine', async function () {
    expect(existingMachine).to.be.an('object')
    if (typeof existingMachine !== 'undefined') {
      await existingMachine.reload()
      expect(existingMachine).to.be.an('object')
    }
  })

  it('can get specific strength machine', async function () {
    expect(existingMachine).to.be.an('object')
    if (typeof existingMachine !== 'undefined') {
      const strengthMachine = await userSession.getStrengthMachine({ id: existingMachine.id })

      expect(strengthMachine).to.be.an('object')
      expect(strengthMachine.id).to.equal(existingMachine.id)
    }
  })
})
