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
  let accessControlIPRange: FacilityAccessControlIPRange

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    if (typeof facilities[0]?.facility !== 'undefined') {
      facility = facilities[0].facility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can access preloaded facility access control IP ranges', async function () {
    accessControl = await facility.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.facilityAccessControlIPRanges)).to.equal(true)
  })

  it('can create facility access control IP range', async function () {
    accessControlIPRange = await accessControl.createFacilityAccessControlIPRange({ cidr: '192.168.0.0/32' })

    expect(accessControlIPRange.cidr).to.equal('192.168.0.0/32')
  })

  it('can get facility access control IP ranges dynamically', async function () {
    let accessControlIPRanges = await accessControl.getFacilityAccessControlIPRanges()

    expect(Array.isArray(accessControlIPRanges)).to.equal(true)
    expect(accessControlIPRanges.length).to.be.above(0)
  })

  it('can reload facility access control IP range', async function () {
    accessControlIPRange = await accessControlIPRange.reload()

    expect(accessControlIPRange.cidr).to.equal('192.168.0.0/32')
  })

  it('can delete facility access control IP range', async function () {
    await accessControlIPRange.delete()

    let extError
    try {
      await accessControlIPRange.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
