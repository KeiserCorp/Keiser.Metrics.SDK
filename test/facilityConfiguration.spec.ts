import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { CompositionType, FacilityConfiguration } from '../src/models/facilityConfiguration'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Configuration', function () {
  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let facilityConfiguration: FacilityConfiguration
  let originalFacilityConfigurationParameters: {
    memberIdentificationComposition: CompositionType
    memberIdentificationForceLength: boolean
    memberIdentificationLength: number
    memberSecretComposition: CompositionType
    memberSecretForceLength: boolean
    memberSecretLength: number
    memberRequireEmail: boolean
  }

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

  it('can get facility configuration', async function () {
    facilityConfiguration = await privilegedFacility.getConfiguration()

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    originalFacilityConfigurationParameters = {
      memberIdentificationComposition: facilityConfiguration.memberIdentificationComposition,
      memberIdentificationForceLength: facilityConfiguration.memberSecretForceLength,
      memberIdentificationLength: facilityConfiguration.memberIdentificationLength,
      memberSecretComposition: facilityConfiguration.memberSecretComposition,
      memberSecretForceLength: facilityConfiguration.memberSecretForceLength,
      memberSecretLength: facilityConfiguration.memberSecretLength,
      memberRequireEmail: facilityConfiguration.memberRequireEmail
    }
  })

  it('can update facility configuration', async function () {
    facilityConfiguration = await facilityConfiguration.update({
      memberIdentificationComposition: CompositionType.Alpha,
      memberIdentificationForceLength: true,
      memberIdentificationLength: 8,
      memberSecretComposition: CompositionType.Alpha,
      memberSecretForceLength: true,
      memberSecretLength: 6,
      memberRequireEmail: false
    })

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    expect(facilityConfiguration.memberIdentificationComposition).to.equal(CompositionType.Alpha)
    expect(facilityConfiguration.memberIdentificationRegex).to.equal('^[a-z0-9]{8}$')
    expect(facilityConfiguration.memberRequireEmail).to.equal(false)
  })

  it('can revert facility configuration', async function () {
    facilityConfiguration = await facilityConfiguration.update({ ...originalFacilityConfigurationParameters })

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    expect(facilityConfiguration.memberIdentificationComposition).to.equal(originalFacilityConfigurationParameters.memberIdentificationComposition)
    expect(facilityConfiguration.memberIdentificationLength).to.equal(originalFacilityConfigurationParameters.memberIdentificationLength)
    expect(facilityConfiguration.memberRequireEmail).to.equal(originalFacilityConfigurationParameters.memberRequireEmail)
  })

  it('can reload facility configuration', async function () {
    facilityConfiguration = await facilityConfiguration.reload()

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    expect(facilityConfiguration.memberIdentificationComposition).to.equal(originalFacilityConfigurationParameters.memberIdentificationComposition)
    expect(facilityConfiguration.memberIdentificationLength).to.equal(originalFacilityConfigurationParameters.memberIdentificationLength)
    expect(facilityConfiguration.memberRequireEmail).to.equal(originalFacilityConfigurationParameters.memberRequireEmail)
  })

  it('can get facility initialization jwt', async function () {
    const machineInitializerToken = await privilegedFacility.getFacilityStrengthMachineInitializerJWTToken()

    expect(typeof machineInitializerToken).to.not.equal('undefined')
    expect(typeof machineInitializerToken.initializerToken).to.equal('string')
    expect(typeof machineInitializerToken.url).to.equal('string')
  })

  it('can get facility initialization otp', async function () {
    const machineInitializerToken = await privilegedFacility.getFacilityStrengthMachineInitializerOTPToken()

    expect(typeof machineInitializerToken).to.not.equal('undefined')
    expect(typeof machineInitializerToken.initializerToken).to.equal('string')
    expect(typeof machineInitializerToken.url).to.equal('string')
    expect(typeof machineInitializerToken.expiresAt).to.equal('object')
  })
})
