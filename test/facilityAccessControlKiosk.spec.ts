import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityAccessControlKiosk, PrimaryIdentification, SecondaryIdentification } from '../src/models/facilityAccessControlKiosk'
import { UserSession } from '../src/session'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Access Control Kiosk', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let facilityAccessControlKiosk: FacilityAccessControlKiosk

  before(async function () {
    metricsInstance = getMetricsInstance()
    userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    const privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()

    const accessControl = await privilegedFacility.getAccessControl()
    const tmpFacilityAccessControlKiosk = accessControl.eagerFacilityAccessControlKiosk()
    if (typeof tmpFacilityAccessControlKiosk !== 'undefined') {
      facilityAccessControlKiosk = tmpFacilityAccessControlKiosk
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
      allowFingerprint: true,
      primaryIdentification: PrimaryIdentification.MemberIdentifier,
      secondaryIdentification: SecondaryIdentification.MemberSecret
    })

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(facilityAccessControlKiosk.kioskModeAllowed).to.equal(true)
    expect(facilityAccessControlKiosk.allowFingerprint).to.equal(true)
    expect(facilityAccessControlKiosk.primaryIdentification).to.equal(PrimaryIdentification.MemberIdentifier)
    expect(facilityAccessControlKiosk.secondaryIdentification).to.equal(SecondaryIdentification.MemberSecret)
  })

  it('can update facility access control kiosk to disable fingerprint', async function () {
    facilityAccessControlKiosk = await facilityAccessControlKiosk.update({
      kioskModeAllowed: true,
      allowFingerprint: false,
      primaryIdentification: PrimaryIdentification.MemberIdentifier,
      secondaryIdentification: SecondaryIdentification.MemberSecret
    })

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(facilityAccessControlKiosk.kioskModeAllowed).to.equal(true)
    expect(facilityAccessControlKiosk.allowFingerprint).to.equal(false)
    expect(facilityAccessControlKiosk.primaryIdentification).to.equal(PrimaryIdentification.MemberIdentifier)
    expect(facilityAccessControlKiosk.secondaryIdentification).to.equal(SecondaryIdentification.MemberSecret)
  })

  it('can update facility access control kiosk to disabled', async function () {
    facilityAccessControlKiosk = await facilityAccessControlKiosk.update({
      kioskModeAllowed: false,
      allowFingerprint: false
    })

    expect(typeof facilityAccessControlKiosk).to.equal('object')
    expect(facilityAccessControlKiosk.kioskModeAllowed).to.equal(false)
    expect(facilityAccessControlKiosk.allowFingerprint).to.equal(false)
    expect(facilityAccessControlKiosk.primaryIdentification).to.equal(PrimaryIdentification.MemberIdentifier)
    expect(facilityAccessControlKiosk.secondaryIdentification).to.equal(SecondaryIdentification.None)
  })
})
