import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControl } from '../src/models/facilityAccessControl'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('Facility Access Control', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let facility: PrivilegedFacility
  let accessControl: FacilityAccessControl

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
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

  it('can get facility access control', async function () {
    accessControl = await facility.getAccessControl()

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
