import { expect } from 'chai'
import Metrics from '../src'
import { Facility, FacilitySorting, PrivilegedFacility } from '../src/models/facility'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let facility: Facility | undefined
  let existingFacility: Facility

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    facility = (await userSession.user.getFacilityEmploymentRelationships())[0].eagerFacility()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list facilities', async function () {
    const facilities = await userSession.getFacilities()
    existingFacility = facilities[0]

    expect(Array.isArray(facilities)).to.equal(true)
    expect(facilities.length).to.be.above(0)
    expect(facilities.meta.sort).to.equal(FacilitySorting.ID)
  })

  it('can reload facility', async function () {
    expect(existingFacility).to.be.an('object')
    if (typeof existingFacility !== 'undefined') {
      await existingFacility.reload()
      expect(existingFacility).to.be.an('object')
    }
  })

  it('can get specific facility', async function () {
    expect(existingFacility).to.be.an('object')
    if (typeof existingFacility !== 'undefined') {
      const facility = await userSession.getFacility({ id: existingFacility.id })

      expect(facility).to.be.an('object')
      expect(facility.id).to.equal(existingFacility.id)
    }
  })

  it('has facility properties', async function () {
    expect(typeof facility).to.equal('object')
    expect(typeof facility?.id).to.equal('number')
  })

  it('facility has facility profile', async function () {
    if (facility) {
      expect(typeof facility).to.equal('object')
      const profile = facility.eagerFacilityProfile()
      expect(typeof profile).to.equal('object')
      expect(typeof profile?.name).to.equal('string')
    }
  })

  it('cannot reload facility profile without active', async function () {
    const profile = facility?.eagerFacilityProfile()
    if (profile) {
      let extError

      try {
        await profile.reload()
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
        expect(typeof userSession.eagerActiveFacility()).to.equal('undefined')
        expect(facility.isActive).to.equal(false)

        await facility.setActive()

        expect(facility.isActive).to.equal(true)
        expect(userSession.eagerActiveFacility() instanceof PrivilegedFacility).to.equal(true)
      }
    }
  })

  it('can reload facility profile with active', async function () {
    const profile = facility?.eagerFacilityProfile()
    if (profile) {
      const facilityProfile = await profile.reload()

      expect(typeof facilityProfile).to.equal('object')
      expect(typeof facilityProfile.name).to.equal('string')
    }
  })

  it('can update facility profile with active', async function () {
    const profile = userSession.eagerActiveFacility()?.eagerFacilityProfile()
    if (profile) {
      const facilityProfile = await profile.update({ name: '_test_' })

      expect(typeof facilityProfile).to.equal('object')
      expect(facilityProfile.name).to.equal('_test_')
    }
  })

})
