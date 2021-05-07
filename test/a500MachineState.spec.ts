import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { ForceUnit } from '../src/constants'
import { A500MachineState } from '../src/models/a500MachineState'
import { PrivilegedFacility } from '../src/models/facility'
import { StrengthMachineIdentifier } from '../src/models/strengthMachine'
import { StrengthMachineSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('A500 Machine State', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let strengthMachineSession: StrengthMachineSession
  let a500MachineState: A500MachineState
  const strengthMachineIdentifier: StrengthMachineIdentifier = {
    machineModel: '1399',
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })

    const userSession = await AuthenticatedUser(metricsInstance)
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
      const machineInitializerToken = await facility.getFacilityStrengthMachineInitializerJWTToken()
      strengthMachineSession = await metricsInstance.authenticateWithMachineInitializerToken({ machineInitializerToken: machineInitializerToken.initializerToken, strengthMachineIdentifier })
    }
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
