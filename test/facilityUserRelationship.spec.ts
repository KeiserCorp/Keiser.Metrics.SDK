import { expect } from 'chai'
import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole, FacilityUserRelationship, FacilityUserRelationshipSorting } from '../src/models/facilityRelationship'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility to User Relationship', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let facilityRelationship: FacilityUserRelationship
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    facility = (await userSession.user.getFacilityEmploymentRelationships())[0].facility
    await facility.setActive()
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

  it('can create new facility user', async function () {
    facilityRelationship = await facility.createFacilityUser({ email: newUserEmailAddress, name: 'Tester', member: true, employeeRole: FacilityEmployeeRole.Trainer })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(true)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.Trainer)
  })

  it('can update facility relationships', async function () {
    facilityRelationship = await facilityRelationship.update({ member: false, employeeRole: FacilityEmployeeRole.CustomerSupport })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(false)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.CustomerSupport)
  })

  it('can reload facility relationships', async function () {
    facilityRelationship = await facilityRelationship.reload()

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.member).to.equal(false)
    expect(facilityRelationship.employeeRole).to.equal(FacilityEmployeeRole.CustomerSupport)
  })

  it('can delete facility relationship', async function () {
    let extError

    await facilityRelationship.delete()

    try {
      await facilityRelationship.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
