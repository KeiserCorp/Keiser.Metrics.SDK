import { expect } from 'chai'
import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControl } from '../src/models/facilityAccessControl'
import { FacilityAccessControlIPRange } from '../src/models/facilityAccessControlIPRange'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Access Control IP Range', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let accessControl: FacilityAccessControl
  let createdAccessControlIPRange: FacilityAccessControlIPRange

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can access preloaded facility access control IP ranges', async function () {
    accessControl = await facility.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.eagerFacilityAccessControlIPRanges())).to.equal(true)
  })

  it('can create facility access control IP range', async function () {
    createdAccessControlIPRange = await accessControl.createFacilityAccessControlIPRange({ cidr: '192.168.0.0/32' })

    expect(createdAccessControlIPRange.cidr).to.equal('192.168.0.0/32')
  })

  it('can get facility access control IP ranges dynamically', async function () {
    let accessControlIPRanges = await accessControl.getFacilityAccessControlIPRanges()

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
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
