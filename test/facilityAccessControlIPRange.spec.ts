import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControl } from '../src/models/facilityAccessControl'
import { FacilityAccessControlIPRange } from '../src/models/facilityAccessControlIPRange'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Access Control IP Range', function () {
  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let accessControl: FacilityAccessControl
  let createdAccessControlIPRange: FacilityAccessControlIPRange

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can access preloaded facility access control IP ranges', async function () {
    accessControl = await privilegedFacility.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.eagerFacilityAccessControlIPRanges())).to.equal(true)
  })

  it('can create facility access control IP range', async function () {
    createdAccessControlIPRange = await accessControl.createFacilityAccessControlIPRange({ cidr: '192.168.0.0/32' })

    expect(createdAccessControlIPRange.cidr).to.equal('192.168.0.0/32')
  })

  it('can get facility access control IP ranges dynamically', async function () {
    const accessControlIPRanges = await accessControl.getFacilityAccessControlIPRanges()

    expect(Array.isArray(accessControlIPRanges)).to.equal(true)
    expect(accessControlIPRanges.length).to.be.above(0)
  })

  it('can reload facility access control IP range', async function () {
    createdAccessControlIPRange = await createdAccessControlIPRange.reload()

    expect(createdAccessControlIPRange.cidr).to.equal('192.168.0.0/32')
  })

  it('can get specific facility access control IP range', async function () {
    const accessControlRange = await accessControl.getFacilityAccessControlIPRange({ id: createdAccessControlIPRange.id })

    expect(accessControlRange.id).to.equal(createdAccessControlIPRange.id)
    expect(accessControlRange.cidr).to.equal(createdAccessControlIPRange.cidr)
  })

  it('can delete facility access control IP range', async function () {
    await createdAccessControlIPRange.delete()

    let extError
    try {
      await createdAccessControlIPRange.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
