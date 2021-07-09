import { expect } from 'chai'

import Metrics from '../src'
import { ForceUnit } from '../src/constants'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityStrengthMachineConfiguration } from '../src/models/facilityStrengthMachinesConfiguration'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Machines Configuration', function () {
  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let facilityStrengthMachineConfiguration: FacilityStrengthMachineConfiguration

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility machine configuration', async function () {
    facilityStrengthMachineConfiguration = await privilegedFacility.getFacilityStrengthMachineConfiguration()

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(typeof facilityStrengthMachineConfiguration.timeZone).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.forceUnit).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.primaryFocus).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.secondaryFocus).to.equal('string')
  })

  it('can update facility machines configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.update({
      timeZone: 'America/Denver',
      forceUnit: ForceUnit.Kilograms,
      primaryFocus: 'velocity',
      secondaryFocus: 'force',
      locale: 'en-us'
    })

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnit).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
    expect(facilityStrengthMachineConfiguration.locale).to.equal('en-us')
  })

  it('can reload facility machines configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.reload()

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnit).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
    expect(facilityStrengthMachineConfiguration.locale).to.equal('en-us')
  })
})
