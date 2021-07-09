import { expect } from 'chai'

import Metrics from '../src'
import { ForceUnit } from '../src/constants'
import { A500MachineState } from '../src/models/a500MachineState'
import { StrengthMachineIdentifier } from '../src/models/strengthMachine'
import { StrengthMachineSession } from '../src/session'
import { getDemoUserSession, getMetricsInstance, setActiveEmployeeFacility } from './utils/fixtures'

describe('A500 Machine State', function () {
  const strengthMachineIdentifier: StrengthMachineIdentifier = {
    machineModel: '1399',
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }

  let metricsInstance: Metrics
  let strengthMachineSession: StrengthMachineSession
  let a500MachineState: A500MachineState

  before(async function () {
    metricsInstance = getMetricsInstance()
    const demoUserSession = await getDemoUserSession(metricsInstance)
    const privilegedFacility = await setActiveEmployeeFacility(demoUserSession)
    const machineInitializerToken = await privilegedFacility.getFacilityStrengthMachineInitializerJWTToken()
    strengthMachineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: machineInitializerToken.initializerToken, strengthMachineIdentifier })
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get a500 machine state', async function () {
    a500MachineState = await strengthMachineSession.getA500MachineState()

    expect(typeof a500MachineState).to.not.equal('undefined')
    expect(typeof a500MachineState.forceUnit).to.equal('string')
    expect(typeof a500MachineState.primaryFocus).to.equal('string')
    expect(typeof a500MachineState.secondaryFocus).to.equal('string')
  })

  it('can update a500 machine state', async function () {
    a500MachineState = await a500MachineState.update({
      forceUnit: ForceUnit.Pounds,
      primaryFocus: 'rom',
      secondaryFocus: 'velocity'
    })
    expect(a500MachineState.forceUnit).to.equal(ForceUnit.Pounds)
    expect(a500MachineState.primaryFocus).to.equal('rom')
    expect(a500MachineState.secondaryFocus).to.equal('velocity')
  })
})
