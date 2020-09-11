import { expect } from 'chai'
import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole, FacilityUserEmployeeRelationship, FacilityUserMemberRelationship, FacilityUserRelationship, FacilityUserRelationshipSorting } from '../src/models/facilityRelationship'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility to User Relationship', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let existingFacilityRelationship: FacilityUserMemberRelationship
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    if (typeof facilities[0]?.facility !== 'undefined') {
      facility = facilities[0].facility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get list of member relationships', async function () {
    const facilityRelationships = await facility.getMemberRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].member).to.equal(true)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can get list of member relationships by name', async function () {
    const facilityRelationships = await facility.getMemberRelationships({ name: 'Moe' })

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].member).to.equal(true)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can get list of employee relationships', async function () {
    const facilityRelationships = await facility.getEmployeeRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].employeeRole).to.not.equal(null)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can create new facility member user', async function () {
    const facilityRelationship = await facility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Tester', employeeRole: FacilityEmployeeRole.Trainer })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(true)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.Trainer)
    existingFacilityRelationship = facilityRelationship
  })

  it('can update facility relationship', async function () {
    const facilityRelationship = await existingFacilityRelationship.update({ member: false, employeeRole: FacilityEmployeeRole.CustomerSupport })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(false)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.CustomerSupport)
  })

  it('can reload facility relationship', async function () {
    const facilityRelationship = await existingFacilityRelationship.reload()

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(false)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.CustomerSupport)
  })

  it('can get specific facility relationship', async function () {
    const facilityRelationship = await facility.getRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.member).to.equal(existingFacilityRelationship.member)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof FacilityUserRelationship).to.equal(true)
    expect(facilityRelationship instanceof FacilityUserMemberRelationship).to.equal(false)
    expect(facilityRelationship instanceof FacilityUserEmployeeRelationship).to.equal(false)
  })

  it('can get specific facility member relationship', async function () {
    const facilityRelationship = await facility.getMemberRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.member).to.equal(existingFacilityRelationship.member)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof FacilityUserMemberRelationship).to.equal(true)
    expect(facilityRelationship instanceof FacilityUserEmployeeRelationship).to.equal(false)
  })

  it('can get specific facility employee relationship', async function () {
    const facilityRelationship = await facility.getEmployeeRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.member).to.equal(existingFacilityRelationship.member)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof FacilityUserMemberRelationship).to.equal(false)
    expect(facilityRelationship instanceof FacilityUserEmployeeRelationship).to.equal(true)
  })

  it('can delete facility relationship', async function () {
    let extError

    await existingFacilityRelationship.delete()

    try {
      await existingFacilityRelationship.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})