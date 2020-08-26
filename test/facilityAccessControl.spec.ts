import { expect } from 'chai'
import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControl } from '../src/models/facilityAccessControl'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Access Control', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let facility: PrivilegedFacility
  let accessControl: FacilityAccessControl

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    if (typeof facilities[0]?.facility !== 'undefined') {
      facility = facilities[0].facility
      await facility.setActive()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility access control', async function () {
    accessControl = await facility.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.facilityAccessControlIPRanges)).to.equal(true)
    expect(typeof accessControl.facilityAccessControlKiosk).to.equal('object')
  })

  it('can reload facility access control', async function () {
    accessControl = await accessControl.reload()

    expect(typeof accessControl).to.not.equal('undefined')
    expect(Array.isArray(accessControl.facilityAccessControlIPRanges)).to.equal(true)
    expect(typeof accessControl.facilityAccessControlKiosk).to.equal('object')
  })

})
