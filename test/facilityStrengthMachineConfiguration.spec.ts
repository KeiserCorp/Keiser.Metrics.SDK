import { expect } from 'chai'

import { ForceUnit } from '../src/constants'
import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityStrengthMachineConfiguration } from '../src/models/facilityStrengthMachineConfiguration'
import { StrengthMachineAppType } from '../src/models/strengthMachine'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Machine Configuration', function () {
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
    expect(typeof facilityStrengthMachineConfiguration.appType).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.timeZone).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.forceUnit).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.primaryFocus).to.equal('string')
    expect(typeof facilityStrengthMachineConfiguration.secondaryFocus).to.equal('string')
  })

  it('can update facility machine configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.update({
      appType: StrengthMachineAppType.Commercial,
      timeZone: 'America/Denver',
      forceUnit: ForceUnit.Kilograms,
      primaryFocus: 'velocity',
      secondaryFocus: 'force',
      locale: 'en-us'
    })

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.appType).to.equal(StrengthMachineAppType.Commercial)
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnit).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
    expect(facilityStrengthMachineConfiguration.locale).to.equal('en-us')
  })

  it('can reload facility machine configuration', async function () {
    facilityStrengthMachineConfiguration = await facilityStrengthMachineConfiguration.reload()

    expect(typeof facilityStrengthMachineConfiguration).to.not.equal('undefined')
    expect(facilityStrengthMachineConfiguration.appType).to.equal(StrengthMachineAppType.Commercial)
    expect(facilityStrengthMachineConfiguration.timeZone).to.equal('America/Denver')
    expect(facilityStrengthMachineConfiguration.forceUnit).to.equal(ForceUnit.Kilograms)
    expect(facilityStrengthMachineConfiguration.primaryFocus).to.equal('velocity')
    expect(facilityStrengthMachineConfiguration.secondaryFocus).to.equal('force')
    expect(facilityStrengthMachineConfiguration.locale).to.equal('en-us')
  })

  it('can subscribe to facility machine configuration changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = facilityStrengthMachineConfiguration.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update') {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await facilityStrengthMachineConfiguration.update({
      appType: StrengthMachineAppType.Commercial,
      timeZone: 'America/Denver',
      forceUnit: ForceUnit.Kilograms,
      primaryFocus: 'power',
      secondaryFocus: 'force',
      locale: 'en-us'
    })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('update')
    expect(modelChangeEvent.id).to.equal(privilegedFacility.id)
  })
})
