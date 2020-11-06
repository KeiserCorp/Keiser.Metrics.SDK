import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { CardioMachine, CardioMachineSorting } from '../src/models/cardioMachine'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Cardio Machine', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let existingMachine: CardioMachine

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

  it('can list cardio machines', async function () {
    const cardioMachines = await userSession.getCardioMachines()
    existingMachine = cardioMachines[0]

    expect(Array.isArray(cardioMachines)).to.equal(true)
    expect(cardioMachines.length).to.be.above(0)
    expect(cardioMachines.meta.sort).to.equal(CardioMachineSorting.ID)
  })

  it('can reload cardio machine', async function () {
    expect(existingMachine).to.be.an('object')
    if (typeof existingMachine !== 'undefined') {
      await existingMachine.reload()
      expect(existingMachine).to.be.an('object')
    }
  })

  it('can get specific cardio machine', async function () {
    expect(existingMachine).to.be.an('object')
    if (typeof existingMachine !== 'undefined') {
      const cardioMachine = await userSession.getCardioMachine({ id: existingMachine.id })

      expect(cardioMachine).to.be.an('object')
      expect(cardioMachine.id).to.equal(existingMachine.id)
    }
  })
})