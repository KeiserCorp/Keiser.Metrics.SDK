import { expect } from 'chai'
import Metrics from '../src'
import { ActionPreventedError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityUserRelationshipSorting, UserFacilityEmployeeRelationship, UserFacilityMemberRelationship } from '../src/models/facilityRelationship'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User to Facility Relationship', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  let existingFacilityRelationship: UserFacilityMemberRelationship

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get list of member facility relationships', async function () {
    const facilityRelationships = await user.getFacilityMembershipRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can get list of employer facility relationships', async function () {
    const facilityRelationships = await user.getFacilityEmploymentRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].employeeRole).to.equal('admin')
    existingFacilityRelationship = facilityRelationships[0]
  })

  it('can access facility instance', async function () {
    expect(typeof existingFacilityRelationship.facility).to.equal('object')
    expect(typeof existingFacilityRelationship.facility?.id).to.equal('number')
    expect(existingFacilityRelationship.facility instanceof PrivilegedFacility).to.equal(true)
  })

  it('can reload facility relationship', async function () {
    const facilityRelationship = await existingFacilityRelationship.reload()

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.employeeRole).to.equal('admin')
  })

  it('can get specific facility relationship', async function () {
    const facilityRelationship = await user.getFacilityRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof UserFacilityMemberRelationship).to.equal(false)
    expect(facilityRelationship instanceof UserFacilityEmployeeRelationship).to.equal(false)
  })

  it('can get specific facility membership relationship', async function () {
    const facilityRelationship = await user.getFacilityMembershipRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship instanceof UserFacilityMemberRelationship).to.equal(true)
    expect(facilityRelationship instanceof UserFacilityEmployeeRelationship).to.equal(false)
    expect(facilityRelationship.facility instanceof PrivilegedFacility).to.equal(false)
  })

  it('can get specific facility employee relationship', async function () {
    const facilityRelationship = await user.getFacilityEmployeeRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship instanceof UserFacilityMemberRelationship).to.equal(false)
    expect(facilityRelationship instanceof UserFacilityEmployeeRelationship).to.equal(true)
    expect(facilityRelationship.facility instanceof PrivilegedFacility).to.equal(true)
  })

  it('can try to delete facility relationships', async function () {
    let extError

    try {
      await existingFacilityRelationship.delete()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(ActionPreventedError.code)
  })

})
