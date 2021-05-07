import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole } from '../src/models/facilityRelationship'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Initiated Facility Relationship Request', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let newUser: User
  let userSession: UserSession
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const newUserMemberId = [...Array(6)].map(i => (~~(Math.random() * 10)).toString()).join('')

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const createUserResponse = await metricsInstance.createUser({ email: newUserEmailAddress, returnUrl: 'localhost:8080' }) as { authorizationCode: string }
    const authenticationResponse = await metricsInstance.userFulfillment({ authorizationCode: createUserResponse.authorizationCode, password: DemoPassword, acceptedTermsRevision: '2019-01-01', name: 'Test', birthday: '1990-01-01', gender: Gender.Male, language: 'en', units: Units.Imperial })
    newUser = (await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })).user

    const exchangeResponse = await metricsInstance.authenticate({ email: DemoEmail, password: DemoPassword })
    userSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: exchangeResponse.exchangeToken })
    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    facility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await facility.setActive()
  })

  after(async function () {
    await newUser.delete()
    metricsInstance?.dispose()
  })

  it('can request member relationship', async function () {
    const facilityRelationshipRequest = await facility.createRelationshipRequest({ email: newUserEmailAddress, member: true, memberIdentifier: newUserMemberId, employeeRole: FacilityEmployeeRole.FrontDesk })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(false)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(true)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequest.employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)
  })

  it('can deny facility initiated relationship', async function () {
    let facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)

    await facilityRelationshipRequests[0].deny()
    facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)
  })

  it('can re-request relationship', async function () {
    const facilityRelationshipRequest = await facility.createRelationshipRequest({ email: newUserEmailAddress, member: true, memberIdentifier: newUserMemberId, employeeRole: FacilityEmployeeRole.FrontDesk })

    expect(typeof facilityRelationshipRequest).to.equal('object')
    expect(facilityRelationshipRequest.userApproval).to.equal(false)
    expect(facilityRelationshipRequest.facilityApproval).to.equal(true)
    expect(facilityRelationshipRequest.member).to.equal(true)
    expect(facilityRelationshipRequest.memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequest.employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)
  })

  it('can approve facility initiated relationship', async function () {
    let facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()

    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(typeof facilityRelationshipRequests[0]).to.equal('object')
    expect(facilityRelationshipRequests[0].userApproval).to.equal(false)
    expect(facilityRelationshipRequests[0].facilityApproval).to.equal(true)
    expect(facilityRelationshipRequests[0].member).to.equal(true)
    expect(facilityRelationshipRequests[0].memberIdentifier).to.equal(newUserMemberId)
    expect(facilityRelationshipRequests[0].employeeRole).to.equal(FacilityEmployeeRole.FrontDesk)

    await facilityRelationshipRequests[0].approve()
    facilityRelationshipRequests = await newUser.getFacilityRelationshipRequests()
    expect(Array.isArray(facilityRelationshipRequests)).to.equal(true)
    expect(facilityRelationshipRequests.length).to.equal(0)

    const facilities = await userSession.getFacilities()
    expect(Array.isArray(facilities)).to.equal(true)
    expect(typeof facilities[0]).to.equal('object')
    expect(facilities[0].id).to.equal(facility.id)
  })
})
