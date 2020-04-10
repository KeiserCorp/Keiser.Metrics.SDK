import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { Facility, PrivilegedFacility } from '../src/models/facility'

describe.only('Facility', function () {
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

  // To-Do: Add Facility Profile Update Logic

  it('can get updated facility profile', async function () {
    if (session.activeFacility) {
      const facilityProfile = await session.activeFacility.getFacilityProfile()
      expect(typeof facilityProfile).to.equal('object')
      expect(typeof facilityProfile.name).to.equal('string')
    }
  })

})
