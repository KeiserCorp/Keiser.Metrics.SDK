import { expect } from 'chai'

import Metrics from '../src'
import { CardioMachine, CardioMachineSorting } from '../src/models/cardioMachine'
import { UserSession } from '../src/session'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Cardio Machine', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let existingMachine: CardioMachine

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await createNewUserSession(metricsInstance)
  })

  after(function () {
    metricsInstance?.dispose()
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
