import { expect } from 'chai'

import Metrics from '../src'
import { A500MachineState } from '../src/models/a500MachineState'
import { PrivilegedFacility } from '../src/models/facility'
import { ForceUnit } from '../src/models/strengthMachineDataSet'
import { MachineSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('A500 Machine State', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let machineSession: MachineSession
  let a500MachineState: A500MachineState
  const a500Machine = {
    machineModel: 1399,
    firmwareVersion: '00000000',
    softwareVersion: '00000000',
    mainBoardSerial: '1234 5678 9012 3456 7890',
    displayUUID: '1234567890123456',
    leftCylinderSerial: '01234567',
    rightCylinderSerial: '23456789'
  }

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
      const facilityConfiguration = await facility.getA500Qr()
      machineSession = await metricsInstance.authenticateWithA500MachineToken({ ...a500Machine, machineInitializerToken: facilityConfiguration.accessToken })
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get a500 machine state', async function () {
    a500MachineState = await machineSession.getA500MachineState()

    expect(typeof a500MachineState).to.not.equal('undefined')
    expect(typeof a500MachineState.forceUnits).to.equal('string')
    expect(typeof a500MachineState.primaryFocus).to.equal('string')
    expect(typeof a500MachineState.secondaryFocus).to.equal('string')
  })

  it('can update a500 machine state', async function () {
    a500MachineState = await a500MachineState.update({
      forceUnits: ForceUnit.Pounds,
      primaryFocus: 'rom',
      secondaryFocus: 'velocity'
    })
    expect(a500MachineState.forceUnits).to.equal(ForceUnit.Pounds)
    expect(a500MachineState.primaryFocus).to.equal('rom')
    expect(a500MachineState.secondaryFocus).to.equal('velocity')
  })
})