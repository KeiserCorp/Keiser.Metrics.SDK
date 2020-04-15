import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { Facility, PrivilegedFacility } from '../src/models/facility'

describe('Facility', function () {
  let metricsInstance: Metrics
  let session: Session
  let facility: Facility | undefined

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    facility = (await session.user.getFacilityMembershipRelationships())[0].facility
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('has facilitiy properties', async function () {
    expect(typeof facility).to.equal('object')
    expect(typeof facility?.id).to.equal('number')
  })

  it('facility has facility profile', async function () {
    if (facility) {
      expect(typeof facility).to.equal('object')
      expect(typeof facility.facilityProfile).to.equal('object')
      expect(typeof facility.facilityProfile?.name).to.equal('string')
    }
  })

  it('cannot reload facility profile without active', async function () {
    if (facility?.facilityProfile) {
      let extError

      try {
        await facility.facilityProfile.reload()
      } catch (error) {
        extError = error
      }
      expect(typeof extError).to.not.equal('undefined')
    }
  })

  it('can set active facility', async function () {
    if (facility) {
      expect(facility instanceof PrivilegedFacility).to.equal(true)
      if (facility instanceof PrivilegedFacility) {
        expect(typeof session.activeFacility).to.equal('undefined')
        expect(facility.isActive).to.equal(false)

        await facility.setActive()

        expect(facility.isActive).to.equal(true)
        expect(session.activeFacility instanceof PrivilegedFacility).to.equal(true)
      }
    }
  })

  it('can reload facility profile with active', async function () {
    if (facility?.facilityProfile) {
      const facilityProfile = await facility.facilityProfile.reload()

      expect(typeof facilityProfile).to.equal('object')
      expect(typeof facilityProfile.name).to.equal('string')
    }
  })

  it('can update facility profile with active', async function () {
    if (facility?.facilityProfile) {
      const facilityProfile = await facility.facilityProfile.update({ name: '_test_' })

      expect(typeof facilityProfile).to.equal('object')
      expect(facilityProfile.name).to.equal('_test_')
    }
  })

})
