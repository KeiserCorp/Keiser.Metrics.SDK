import { expect } from 'chai'
import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { User } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User Initiated Facility Relationship Request', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let newUser: User
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newUserMemberId = [...Array(30)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    newUser = (await metricsInstance.createUser({ email: newUserEmailAddress, password: DemoPassword })).user

    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    facility = (await userSession.user.getFacilityMembershipRelationships())[0].facility as PrivilegedFacility
    await facility.setActive()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can request facility relationship', async function () {
    const facilityRelationshipRequest = await (await newUser.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberId })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(true)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(false)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequest.employeeRole).to.equal(null)
  })

  it('can deny user initiated relationship', async function () {
    let facilityRelationshipRequests = await facility.getRelationshipRequests({ memberIdentifier: newUserMemberId })

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(null)

    await facilityRelationshipRequests[0].deny()
    facilityRelationshipRequests = await facility.getRelationshipRequests({ memberIdentifier: newUserMemberId })
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)
  })

  it('can re-request relationship', async function () {
    const facilityRelationshipRequest = await (await newUser.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberId })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(true)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(false)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequest.employeeRole).to.equal(null)
  })

  it('can approve user initiated relationship', async function () {
    let facilityRelationshipRequests = await facility.getRelationshipRequests({ memberIdentifier: newUserMemberId })

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(null)

    await facilityRelationshipRequests[0].approve({ memberIdentifier: newUserMemberId })
    facilityRelationshipRequests = await facility.getRelationshipRequests({ memberIdentifier: newUserMemberId })
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)

    const facilities = await newUser.getFacilities()
    expect(Array.isArray(facilities)).to.equal(true)
    expect(typeof facilities[0]).to.equal('object')
    expect(facilities[0].id).to.equal(facility.id)
  })
})
