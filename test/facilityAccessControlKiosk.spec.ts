import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { FacilityAccessControlKiosk, PrimaryIdentification, SecondaryIdentification } from '../src/models/facilityAccessControlKiosk'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('Facility Access Control Kiosk', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let facilityAccessControlKiosk: FacilityAccessControlKiosk

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const facility = facilities[0]?.eagerFacility()
    if (typeof facility !== 'undefined') {
      await facility.setActive()
      const accessControl = await facility.getAccessControl()
      const tmpFacilityAccessControlKiosk = accessControl.eagerFacilityAccessControlKiosk()
      if (typeof tmpFacilityAccessControlKiosk !== 'undefined') {
        facilityAccessControlKiosk = tmpFacilityAccessControlKiosk
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
