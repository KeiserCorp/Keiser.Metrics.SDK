import { expect } from 'chai'

import Metrics from '../src/core'
import { EmailAddress } from '../src/models/emailAddress'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole } from '../src/models/facilityRelationship'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { randomNumberSequence } from './utils/dummy'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Initiated Facility Relationship Request', function () {
  const newUserMemberIdentifier = randomNumberSequence(6)

  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let newUser: User
  let userSession: UserSession
  let newUserEmailAddress: EmailAddress

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)
    const newUserSession = await createNewUserSession(metricsInstance)
    newUser = newUserSession.user
    newUserEmailAddress = (await newUser.getEmailAddresses({ limit: 1 }))[0]

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(async function () {
    await newUser.delete()
    metricsInstance?.dispose()
  })

  it('can request member relationship', async function () {
    const facilityRelationshipRequest = await privilegedFacility.createRelationshipRequest({ email: newUserEmailAddress.email, member: true, memberIdentifier: newUserMemberIdentifier, employeeRole: FacilityEmployeeRole.FrontDesk })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(false)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(true)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequest.employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)
  })

  it('can deny facility initiated relationship', async function () {
    let facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)

    await facilityRelationshipRequests[0].deny()
    facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)
  })

  it('can re-request relationship', async function () {
    const facilityRelationshipRequest = await privilegedFacility.createRelationshipRequest({ email: newUserEmailAddress.email, member: true, memberIdentifier: newUserMemberIdentifier, employeeRole: FacilityEmployeeRole.FrontDesk })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(false)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(true)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequest.employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)
  })

  it('can approve facility initiated relationship', async function () {
    let facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)

    await facilityRelationshipRequests[0].approve()
    facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)

    const facilities = await userSession.getFacilities()
    expect(Array.isArray(facilities)).to.equal(true)
    expect(typeof facilities[0]).to.equal('object')
    expect(facilities[0].id).to.equal(privilegedFacility.id)
  })
})
