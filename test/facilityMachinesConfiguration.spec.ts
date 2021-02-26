import { expect } from 'chai'

import Metrics from '../src'
import { ForceUnit } from '../src/constants'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityMachinesConfiguration } from '../src/models/facilityMachinesConfiguration'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Machines Configuration', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let facilityMachinesConfiguration: FacilityMachinesConfiguration

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

  it('can get facility machines configuration', async function () {
    facilityMachinesConfiguration = await facility.getFacilityMachinesConfiguration()

    expect(typeof facilityMachinesConfiguration).to.not.equal('undefined')
    expect(typeof facilityMachinesConfiguration.timeZone).to.equal('string')
    expect(typeof facilityMachinesConfiguration.forceUnits).to.equal('string')
    expect(typeof facilityMachinesConfiguration.primaryFocus).to.equal('string')
    expect(typeof facilityMachinesConfiguration.secondaryFocus).to.equal('string')
  })

  it('can update facility machines configuration', async function () {
    facilityMachinesConfiguration = await facilityMachinesConfiguration.update({
      timeZone: 'America/Denver',
      forceUnits: ForceUnit.Kilograms,
      primaryFocus: 'velocity',
      secondaryFocus: 'force'
    })

    expect(typeof facilityMachinesConfiguration).to.not.equal('undefined')
    expect(facilityMachinesConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityMachinesConfiguration.forceUnits).to.equal(ForceUnit.Kilograms)
    expect(facilityMachinesConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityMachinesConfiguration.secondaryFocus).to.equal('force')
  })

  it('can reload facility machines configuration', async function () {
    facilityMachinesConfiguration = await facilityMachinesConfiguration.reload()

    expect(typeof facilityMachinesConfiguration).to.not.equal('undefined')
    expect(facilityMachinesConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityMachinesConfiguration.forceUnits).to.equal(ForceUnit.Kilograms)
    expect(facilityMachinesConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityMachinesConfiguration.secondaryFocus).to.equal('force')
  })
})
