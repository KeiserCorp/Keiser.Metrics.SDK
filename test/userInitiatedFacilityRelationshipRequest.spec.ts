import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { UserSession } from '../src/session'
import { randomNumberSequence } from './utils/dummy'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('User Initiated Facility Relationship Request', function () {
  const newUserMemberIdentifier = randomNumberSequence(6)

  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let newUserSession: UserSession
  let demoUserSession: UserSession

  before(async function () {
    metricsInstance = getMetricsInstance()
    demoUserSession = await getDemoUserSession(metricsInstance)
    newUserSession = await createNewUserSession(metricsInstance)

    const relationship = (await demoUserSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(async function () {
    await newUserSession?.user.delete()
    metricsInstance?.dispose()
  })

  it('can request facility relationship', async function () {
    const facilityRelationshipRequest = await (await newUserSession.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberIdentifier })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(true)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(false)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequest.employeeRole).to.equal(null)
  })

  it('can deny user initiated relationship', async function () {
    let facilityRelationshipRequests = await privilegedFacility.getRelationshipRequests({ memberIdentifier: newUserMemberIdentifier })

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(null)

    await facilityRelationshipRequests[0].deny()
    facilityRelationshipRequests = await privilegedFacility.getRelationshipRequests({ memberIdentifier: newUserMemberIdentifier })
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)
  })

  it('can re-request relationship', async function () {
    const facilityRelationshipRequest = await (await newUserSession.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberIdentifier })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(true)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(false)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequest.employeeRole).to.equal(null)
  })

  it('can approve user initiated relationship', async function () {
    let facilityRelationshipRequests = await privilegedFacility.getRelationshipRequests({ memberIdentifier: newUserMemberIdentifier })

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberIdentifier)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(null)

    await facilityRelationshipRequests[0].approve({ memberIdentifier: newUserMemberIdentifier })
    facilityRelationshipRequests = await privilegedFacility.getRelationshipRequests({ memberIdentifier: newUserMemberIdentifier })
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)

    const facilities = await newUserSession.getFacilities()
    expect(Array.isArray(facilities)).to.equal(true)
    expect(typeof facilities[0]).to.equal('object')
    expect(facilities[0].id).to.equal(privilegedFacility.id)
  })
})
