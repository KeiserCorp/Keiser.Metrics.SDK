import { expect } from 'chai'
import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { CompositionType, FacilityConfiguration } from '../src/models/facilityConfiguration'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Configuration', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let facilityConfiguration: FacilityConfiguration

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

  it('can get facility configuration', async function () {
    facilityConfiguration = await facility.getConfiguration()

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
  })

  it('can update facility configuration', async function () {
    facilityConfiguration = await facilityConfiguration.update({
      memberIdentificationComposition: CompositionType.Alpha,
      memberIdentificationForceLength: true,
      memberIdentificationLength: 8,
      memberSecretComposition: CompositionType.Alpha,
      memberSecretForceLength: true,
      memberSecretLength: 6
    })

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    expect(facilityConfiguration.memberIdentificationComposition).to.equal(CompositionType.Alpha)
    expect(facilityConfiguration.memberIdentificationRegex).to.equal('^[a-z0-9]{8}$')
  })

  it('can reload facility configuration', async function () {
    facilityConfiguration = await facilityConfiguration.reload()

    expect(typeof facilityConfiguration).to.not.equal('undefined')
    expect(typeof facilityConfiguration.memberIdentificationRegex).to.equal('string')
    expect(facilityConfiguration.memberIdentificationComposition).to.equal(CompositionType.Alpha)
    expect(facilityConfiguration.memberIdentificationRegex).to.equal('^[a-z0-9]{8}$')
  })

})
