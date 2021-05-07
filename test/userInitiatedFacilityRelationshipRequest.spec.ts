import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { PrivilegedFacility } from '../src/models/facility'
import { Gender } from '../src/models/profile'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User Initiated Facility Relationship Request', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let newUserSession: UserSession
  let demoUserSession: UserSession
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
    newUserSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: authenticationResponse.exchangeToken })

    const demoAuthenticationResponse = await metricsInstance.authenticate({ email: DemoEmail, password: DemoPassword })
    demoUserSession = await metricsInstance.authenticateWithExchangeToken({ exchangeToken: demoAuthenticationResponse.exchangeToken })
    const facilities = await demoUserSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
    }
  })

  after(async function () {
    await newUserSession.user.delete()
    metricsInstance?.dispose()
  })

  it('can request facility relationship', async function () {
    const facilityRelationshipRequest = await (await newUserSession.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberId })

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
    const facilityRelationshipRequest = await (await newUserSession.getFacilities())[0].createRelationshipRequest({ memberIdentifier: newUserMemberId })

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

    const facilities = await newUserSession.getFacilities()
    expect(Array.isArray(facilities)).to.equal(true)
    expect(typeof facilities[0]).to.equal('object')
    expect(facilities[0].id).to.equal(facility.id)
  })
})
