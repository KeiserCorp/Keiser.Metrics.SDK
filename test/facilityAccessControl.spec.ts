import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControl } from '../src/models/facilityAccessControl'
import { UserSession } from '../src/session'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Access Control', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let privilegedFacility: PrivilegedFacility
  let accessControl: FacilityAccessControl

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility access control', async function () {
    accessControl = await privilegedFacility.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.eagerFacilityAccessControlIPRanges())).to.equal(true)
    expect(typeof accessControl.eagerFacilityAccessControlKiosk()).to.equal('object')
  })

  it('can reload facility access control', async function () {
    accessControl = await accessControl.reload()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.eagerFacilityAccessControlIPRanges())).to.equal(true)
    expect(typeof accessControl.eagerFacilityAccessControlKiosk()).to.equal('object')
  })
})
