import { expect } from 'chai'
import Metrics from '../src'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControlKiosk, PrimaryIdentification, SecondaryIdentification } from '../src/models/facilityAccessControlKiosk'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Facility Access Control Kiosk', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let facility: PrivilegedFacility
  let facilityAccessControlKiosk: FacilityAccessControlKiosk

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
      const accessControl = await facility.getAccessControl()
      if (typeof accessControl.facilityAccessControlKiosk !== 'undefined') {
        facilityAccessControlKiosk = accessControl.facilityAccessControlKiosk
      }
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can reload facility access control kiosk', async function () {
    facilityAccessControlKiosk = await facilityAccessControlKiosk.reload()

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(typeof facilityAccessControlKiosk.kioskModeAllowed).to.equal('boolean')
  })

  it('can update facility access control kiosk', async function () {
    facilityAccessControlKiosk = await facilityAccessControlKiosk.update({
      kioskModeAllowed: true,
      primaryIdentification: PrimaryIdentification.MemberIdentifier,
      secondaryIdentification: SecondaryIdentification.MemberSecret
    })

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(facilityAccessControlKiosk.kioskModeAllowed).to.equal(true)
    expect(facilityAccessControlKiosk.primaryIdentification).to.equal(PrimaryIdentification.MemberIdentifier)
    expect(facilityAccessControlKiosk.secondaryIdentification).to.equal(SecondaryIdentification.MemberSecret)
  })

  it('can update facility access control kiosk to disabled', async function () {
    facilityAccessControlKiosk = await facilityAccessControlKiosk.update({
      kioskModeAllowed: false
    })

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(facilityAccessControlKiosk.kioskModeAllowed).to.equal(false)
    expect(facilityAccessControlKiosk.primaryIdentification).to.equal(PrimaryIdentification.MemberIdentifier)
    expect(facilityAccessControlKiosk.secondaryIdentification).to.equal(SecondaryIdentification.None)
  })
})
