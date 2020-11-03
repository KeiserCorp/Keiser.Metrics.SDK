import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { CardioMachine, CardioMachineLine, CardioMachineParseCode, CardioMachineSorting, PrivilegedCardioMachine } from '../src/models/cardioMachine'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Cardio Machine', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let newMachine: PrivilegedCardioMachine
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
    adminSession = await metricsAdminInstance.authenticateAdminWithCredentials({ email: DemoEmail, password: DemoPassword, token: '123456' })
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
