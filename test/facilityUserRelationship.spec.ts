import { expect } from 'chai'

import MetricsAdmin from '../src/admin'
import Metrics from '../src/core'
import { UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole, FacilityUserEmployeeRelationship, FacilityUserMemberRelationship, FacilityUserRelationship, FacilityUserRelationshipSorting } from '../src/models/facilityRelationship'
import { FacilityMemberUser } from '../src/models/user'
import { randomEmailAddress } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Facility to User Relationship', function () {
  const newUserEmailAddress = randomEmailAddress()

  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let privilegedFacility: PrivilegedFacility
  let existingFacilityRelationship: FacilityUserMemberRelationship
  let createdUser: FacilityMemberUser

  before(async function () {
    metricsInstance = getMetricsInstance()
    metricsAdminInstance = getMetricsAdminInstance()
    const userSession = await getDemoUserSession(metricsInstance)
    const tmpPrivilegedFacility = (await userSession.user.getFacilityEmploymentRelationships())[0].eagerFacility()
    if (typeof tmpPrivilegedFacility !== 'undefined') {
      privilegedFacility = tmpPrivilegedFacility
      await privilegedFacility.setActive()
    }
  })

  after(async function () {
    const metricsSSOInstance = getMetricsSSOInstance()
    const userSession = await getDemoUserSession(metricsInstance)
    const exchangeableAdminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    const adminSession = await metricsAdminInstance.authenticateAdminWithExchangeToken({ exchangeToken: exchangeableAdminSession.exchangeToken })
    await (await adminSession.getUser({ userId: createdUser.id })).delete()
    metricsSSOInstance.dispose()
    metricsInstance?.dispose()
    metricsAdminInstance?.dispose()
  })

  it('can get list of member relationships', async function () {
    const facilityRelationships = await privilegedFacility.getMemberRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].member).to.equal(true)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can get list of member relationships by name', async function () {
    const facilityRelationships = await privilegedFacility.getMemberRelationships({ name: 'Moe' })

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].member).to.equal(true)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can get list of member relationships with active sessions', async function () {
    await (await privilegedFacility.getMemberRelationships())[0].eagerUser().startSession({ forceEndPrevious: true })
    const facilityRelationships = await privilegedFacility.getMemberRelationships({ includeSession: true })

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].member).to.equal(true)
    expect(typeof facilityRelationships[0].eagerActiveSession()).to.equal('object')
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
    expect(facilityRelationships.meta.includeSession).to.equal(true)
  })

  it('can get list of employee relationships', async function () {
    const facilityRelationships = await privilegedFacility.getEmployeeRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].employeeRole).to.not.equal(null)
    expect(facilityRelationships.meta.sort).to.equal(FacilityUserRelationshipSorting.ID)
  })

  it('can create new facility member user', async function () {
    const facilityRelationship = await privilegedFacility.createFacilityMemberUser({ email: newUserEmailAddress, name: 'Tester', employeeRole: FacilityEmployeeRole.Trainer })
    createdUser = facilityRelationship.eagerUser()

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
    const facilityRelationship = await privilegedFacility.getRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.member).to.equal(existingFacilityRelationship.member)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof FacilityUserRelationship).to.equal(true)
    expect(facilityRelationship instanceof FacilityUserMemberRelationship).to.equal(false)
    expect(facilityRelationship instanceof FacilityUserEmployeeRelationship).to.equal(false)
  })

  it('can get specific facility member relationship', async function () {
    const facilityRelationship = await privilegedFacility.getMemberRelationship({ id: existingFacilityRelationship.id })

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.id).to.equal(existingFacilityRelationship.id)
    expect(facilityRelationship.member).to.equal(existingFacilityRelationship.member)
    expect(facilityRelationship.employeeRole).to.equal(existingFacilityRelationship.employeeRole)
    expect(facilityRelationship instanceof FacilityUserMemberRelationship).to.equal(true)
    expect(facilityRelationship instanceof FacilityUserEmployeeRelationship).to.equal(false)
  })

  it('can get specific facility employee relationship', async function () {
    const facilityRelationship = await privilegedFacility.getEmployeeRelationship({ id: existingFacilityRelationship.id })

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
