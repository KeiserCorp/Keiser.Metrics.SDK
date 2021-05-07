import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { UnauthorizedTokenError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { PrimaryIdentification, SecondaryIdentification } from '../src/models/facilityAccessControlKiosk'
import { FacilityUserSession, KioskSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('Facility Kiosk Token', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let kioskSession: KioskSession
  let userSession: FacilityUserSession
  const echipId = [...Array(14)].map(i => (~~(Math.random() * 16)).toString(16)).join('') + '0c'
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

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await AuthenticatedUser(metricsInstance)
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const tmpFacility = facilities[0]?.eagerFacility()
    if (typeof tmpFacility !== 'undefined') {
      facility = tmpFacility
      await facility.setActive()
      const accessControl = await facility.getAccessControl()
      const facilityAccessControlKiosk = accessControl.eagerFacilityAccessControlKiosk()
      if (typeof facilityAccessControlKiosk !== 'undefined') {
        await facilityAccessControlKiosk.update({
          kioskModeAllowed: true,
          primaryIdentification: PrimaryIdentification.UUID,
          secondaryIdentification: SecondaryIdentification.None
        })
      }
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can start kiosk session', async function () {
    kioskSession = await facility.createKioskSession()

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
    userSession = await kioskSession.userLogin({ primaryIdentification: 1 })

    expect(typeof userSession).to.not.equal('undefined')
    expect(typeof userSession.user).to.not.equal('undefined')
    expect(userSession.user.id).to.equal(1)
  })

  it('can use start workout session (facility user session)', async function () {
    const { session, echipData } = await userSession.user.startSession({ echipId, forceEndPrevious: true })

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
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnauthorizedTokenError.code)
  })
})
