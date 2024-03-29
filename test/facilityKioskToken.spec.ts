import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnauthorizedTokenError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { PrimaryIdentification, SecondaryIdentification } from '../src/models/facilityAccessControlKiosk'
import { FingerprintReaderModel } from '../src/models/fingerprint'
import { User } from '../src/models/user'
import { FacilityUserSession, KioskSession } from '../src/session'
import { randomByte, randomEchipId } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Facility Kiosk Token', function () {
  const echipId = randomEchipId()
  const echipData = {
    1621: {
      position: {
        chest: null,
        rom2: null,
        rom1: null,
        seat: null
      },
      sets: [
        {
          version: '4D2C55A5',
          serial: '0730 2015 1323 2541',
          time: new Date(),
          resistance: 41,
          precision: 'int',
          units: 'lb',
          repetitions: 3,
          peak: 154,
          work: 90.56,
          distance: null,
          seat: null,
          rom2: null,
          rom1: null,
          chest: null,
          test: null
        }
      ]
    }
  }

  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let kioskSession: KioskSession
  let user: User
  let facilityUserSession: FacilityUserSession

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)
    user = userSession.user

    const relationship = (await user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()

    const accessControl = await privilegedFacility.getAccessControl()
    const facilityAccessControlKiosk = accessControl.eagerFacilityAccessControlKiosk()
    if (typeof facilityAccessControlKiosk !== 'undefined') {
      await facilityAccessControlKiosk.update({
        isKioskModeAllowed: true,
        isFingerprintAuthenticationAllowed: true,
        primaryIdentification: PrimaryIdentification.UUID,
        secondaryIdentification: SecondaryIdentification.None
      })
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can start kiosk session', async function () {
    kioskSession = await privilegedFacility.createKioskSession()

    expect(typeof kioskSession).to.not.equal('undefined')
    expect(typeof kioskSession.sessionHandler).to.not.equal('undefined')
    expect(typeof kioskSession.sessionHandler.accessToken).to.equal('string')
  })

  it('can restore kiosk session from token', async function () {
    const token = kioskSession.sessionHandler.accessToken
    const restoredKioskSession = await metricsInstance.authenticateWithKioskToken({ kioskToken: token })

    expect(typeof restoredKioskSession).to.not.equal('undefined')
    expect(typeof restoredKioskSession.sessionHandler).to.not.equal('undefined')
    expect(restoredKioskSession.sessionHandler.accessToken).to.equal(token)
  })

  it('can use kiosk session to login user', async function () {
    facilityUserSession = await kioskSession.userLogin({ primaryIdentification: 1 })

    expect(typeof facilityUserSession).to.not.equal('undefined')
    expect(typeof facilityUserSession.user).to.not.equal('undefined')
    expect(facilityUserSession.user.id).to.equal(1)
  })

  it('can use start workout session (facility user session)', async function () {
    const { session, echipData } = await facilityUserSession.user.startSession({ echipId, forceEndPrevious: true })

    expect(typeof session).to.not.equal('undefined')
    expect(typeof echipData).to.not.equal('undefined')
    expect(session.echipId).to.equal(echipId)
    expect(session.startedAt).to.not.equal(null)
    expect(session.endedAt).to.equal(null)
  })

  it('can use kiosk session to update workout session', async function () {
    const session = await kioskSession.sessionUpdate({ echipId, echipData })

    expect(typeof session).to.not.equal('undefined')
    expect(session.echipId).to.equal(echipId)
    expect(session.startedAt).to.not.equal(null)
    expect(session.endedAt).to.equal(null)
  })

  it('can use kiosk session to end workout session', async function () {
    const session = await kioskSession.sessionEnd({ echipId, echipData })

    expect(typeof session).to.not.equal('undefined')
    expect(session.echipId).to.equal(echipId)
    expect(session.startedAt).to.not.equal(null)
    expect(session.endedAt).to.not.equal(null)
  })

  it('can use kiosk session to get facility', async function () {
    const facility = await kioskSession.getFacility()

    expect(typeof facility).to.not.equal('undefined')
    expect(facility.id).to.equal(privilegedFacility.id)
  })

  it('can use kiosk session to get facility access control', async function () {
    const accessControl = await kioskSession.getAccessControl()

    expect(typeof accessControl).to.not.equal('undefined')
  })

  it('can use kiosk session to get facility configuration', async function () {
    const facilityConfiguration = await kioskSession.getConfiguration()

    expect(typeof facilityConfiguration).to.not.equal('undefined')
  })

  it('can use kiosk session to login user with fingerprint', async function () {
    const fingerprintTemplate = (new Uint8Array(498).fill(0)).map(v => randomByte())

    const facilityRelationship = (await user.getFacilityMembershipRelationships())[0]
    const fingerprint = await facilityRelationship.createFingerprint({ template: fingerprintTemplate, fingerprintReaderModel: FingerprintReaderModel.GT521F5 })

    expect(typeof fingerprint).to.equal('object')

    const userSession = await kioskSession.fingerprintLogin({ facilityRelationshipId: facilityRelationship.id, hash: fingerprint.hash })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(1)
  })

  it('can end kiosk session', async function () {
    await kioskSession.logout()

    expect(typeof kioskSession).to.not.equal('undefined')
    expect(typeof kioskSession.sessionHandler).to.not.equal('undefined')
    expect(typeof kioskSession.sessionHandler.accessToken).to.equal('string')
    expect(kioskSession.sessionHandler.accessToken).to.equal('')
  })

  it('cannot use kiosk session after logout', async function () {
    let extError

    try {
      await kioskSession.userLogin({ primaryIdentification: 1 })
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnauthorizedTokenError.code)
  })
})
