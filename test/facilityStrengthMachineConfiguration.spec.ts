import { expect } from 'chai'

import Metrics from '../src'
import { ForceUnit } from '../src/constants'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityStrengthMachineConfiguration } from '../src/models/facilityStrengthMachinesConfiguration'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Machines Configuration', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let facilityStrengthMachineConfiguration: FacilityStrengthMachineConfiguration

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
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility machine configuration', async function () {
    facilityStrengthMachineConfiguration = await facility.getFacilityStrengthMachineConfiguration()

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(typeof facilityStrengthMachineConfiguration.timeZone).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.forceUnits).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.primaryFocus).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.secondaryFocus).to.equal('string')
  })

  it('can update facility machines configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.update({
      timeZone: 'America/Denver',
      forceUnits: ForceUnit.Kilograms,
      primaryFocus: 'velocity',
      secondaryFocus: 'force'
    })

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnits).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
  })

  it('can reload facility machines configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.reload()

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnits).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
  })
})
