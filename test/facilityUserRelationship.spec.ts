import { expect } from 'chai'

import MetricsAdmin from '../src/admin'
import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole, FacilityUserEmployeeRelationship, FacilityUserMemberRelationship, FacilityUserRelationship, FacilityUserRelationshipSorting } from '../src/models/facilityRelationship'
import { FacilityMemberUser } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { randomEmailAddress } from './utils/dummy'
import { getDemoUserSession, getMetricsAdminInstance, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Facility to User Relationship', function () {
  const newUserEmailAddress = randomEmailAddress()

  let metricsInstance: Metrics
  let metricsAdminInstance: MetricsAdmin
  let privilegedFacility: PrivilegedFacility
  let existingFacilityRelationship: FacilityUserMemberRelationship
  const createdUsers: FacilityMemberUser[] = []

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
    await Promise.all(createdUsers.map(async user => await (await adminSession.getUser({ userId: user.id })).delete()))
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
    createdUsers.push(facilityRelationship.eagerUser())

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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can subscribe to facility relationship changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const facilityRelationship = await privilegedFacility.createFacilityMemberUser({ email: randomEmailAddress(), name: 'Tester', employeeRole: FacilityEmployeeRole.Trainer })
    createdUsers.push(facilityRelationship.eagerUser())

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = facilityRelationship.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update' && e.id === facilityRelationship.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await facilityRelationship.update({ employeeRole: FacilityEmployeeRole.CustomerSupport })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('update')
    expect(modelChangeEvent.id).to.equal(facilityRelationship.id)

    await facilityRelationship.delete()
  })

  it('can subscribe to facility relationship list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const employeeRelationships = await privilegedFacility.getEmployeeRelationships({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = employeeRelationships.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (employeeRelationships.length === 0 || e.id !== employeeRelationships[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const facilityRelationship = await privilegedFacility.createFacilityMemberUser({ email: randomEmailAddress(), name: 'Tester', employeeRole: FacilityEmployeeRole.Trainer })
    createdUsers.push(facilityRelationship.eagerUser())

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(facilityRelationship.id)

    await facilityRelationship.delete()
  })
})
