import { expect } from 'chai'
import Metrics, { MetricsAdmin } from '../src'
import { PrivilegedStrengthMachine, StrengthMachineSorting } from '../src/models/strengthMachine'
import { AdminSession, UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

const newNameGen = () => [...Array(16)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

describe('Strength Machine', function () {
  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let userSession: UserSession
  let adminSession: AdminSession
  let newMachine: PrivilegedStrengthMachine

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

  it('can list strength machines', async function () {
    const strengthMachines = await userSession.getStrengthMachines()

    expect(Array.isArray(strengthMachines)).to.equal(true)
    expect(strengthMachines.length).to.be.above(0)
    expect(strengthMachines.meta.sort).to.equal(StrengthMachineSorting.ID)
  })

  it('can reload strength machine', async function () {
    const strengthMachine = (await userSession.getStrengthMachines())[0]

    expect(strengthMachine).to.be.an('object')
    await strengthMachine.reload()
    expect(strengthMachine).to.be.an('object')
  })

  it('can list strength machines with privileges', async function () {
    const strengthMachines = await adminSession.getStrengthMachines()

    expect(Array.isArray(strengthMachines)).to.equal(true)
    expect(strengthMachines.length).to.be.above(0)
    expect(strengthMachines.meta.sort).to.equal(StrengthMachineSorting.ID)
    expect(typeof strengthMachines[0].update).to.equal('function')
  })

  it('can create strength machine', async function () {
    const machine = {
      name: newNameGen(),
      line: 'a250'
    }
    newMachine = await adminSession.createStrengthMachine(machine)

    expect(newMachine).to.be.an('object')
    expect(newMachine.name).to.equal(newMachine.name)
  })

  it('can update strength machine', async function () {
    const newName = newNameGen()
    await newMachine.update({ name: newName, line: newMachine.line })
    expect(newMachine).to.be.an('object')
    expect(newMachine.name).to.equal(newName)
  })

})
