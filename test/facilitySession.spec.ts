import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilitySession, SessionSorting } from '../src/models/session'
import { FacilityMemberUser } from '../src/models/user'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('Facility Session', function () {
  let metricsInstance: MetricsSSO
  let facility: PrivilegedFacility
  let user: FacilityMemberUser
  let createdSession: FacilitySession
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
    }

    user = (await facility.getMemberRelationships())[0]?.eagerUser()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list latest sessions', async function () {
    this.timeout(5000)

    const sessions = await facility.getSessions()

    expect(Array.isArray(sessions)).to.equal(true)
    expect(sessions.meta.sort).to.equal(SessionSorting.StartedAt)
  })

  it('can create new session', async function () {
    const { session } = await user.startSession({ forceEndPrevious: true })

    expect(typeof session).to.equal('object')
    expect(Date.now() - session.startedAt.getTime() < 1000).to.equal(true)
    expect(session.endedAt).to.equal(null)
    createdSession = session
  })

  it('can catch error when creating another new session without ending', async function () {
    let extError

    try {
      await user.startSession({ forceEndPrevious: false })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(ActionPreventedError.code)
  })

  it('can get session status', async function () {
    const userSessions = await user.getCurrentSessions()

    expect(Array.isArray(userSessions)).to.equal(true)
    expect(userSessions.filter(s => s.id === createdSession.id).length).to.equal(1)
  })

  it('can end session', async function () {
    createdSession = await createdSession.end()

    expect(typeof createdSession).to.equal('object')
    expect(Date.now() - createdSession.startedAt.getTime() < 1000).to.equal(true)
    expect(createdSession.endedAt).to.not.equal(null)
  })

  it('can reload session', async function () {
    createdSession = await createdSession.reload()

    expect(typeof createdSession).to.equal('object')
    expect(Date.now() - createdSession.startedAt.getTime() < 1000).to.equal(true)
    expect(createdSession.endedAt).to.not.equal(null)
  })

  it('can get specific session', async function () {
    const session = await facility.getSession({ id: createdSession.id })

    expect(typeof session).to.equal('object')
    expect(session.id).to.equal(createdSession.id)
    expect(session.startedAt.toISOString()).to.equal(createdSession.startedAt.toISOString())
  })

  it('can delete session', async function () {
    await createdSession.delete()

    let extError

    try {
      await createdSession.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

  it('assets user session status undefined', async function () {
    const userSessions = await user.getCurrentSessions()

    expect(Array.isArray(userSessions)).to.equal(true)
    expect(userSessions.filter(s => s.id === createdSession.id).length).to.equal(0)
  })

  it('can create new session using eChip', async function () {
    const { session, echipData } = await user.startSession({ forceEndPrevious: true, echipId })

    expect(typeof echipData).to.equal('object')
    expect(typeof session).to.equal('object')
    expect(Date.now() - session.startedAt.getTime() < 1000).to.equal(true)
    expect(session.endedAt).to.equal(null)
    expect(session.eagerStrengthMachineDataSets()?.length).to.equal(0)
    createdSession = session
  })

  it('can get session using eChip', async function () {
    const echipSession = await facility.getSession({ echipId })

    expect(typeof echipSession).to.equal('object')
    expect(echipSession.id).to.equal(createdSession.id)
  })

  it('can update session using eChip', async function () {
    await createdSession.update({ echipId, echipData })

    expect(typeof createdSession).to.equal('object')
    expect(createdSession.endedAt).to.equal(null)
    expect(createdSession.eagerStrengthMachineDataSets()?.length).to.equal(1)
  })

  it('can end session using eChip', async function () {
    echipData['1621'].sets.push(
      {
        version: '4D2C55A5',
        serial: '0730 2015 1323 2541',
        time: new Date(),
        resistance: 41,
        precision: 'int',
        units: 'lb',
        repetitions: 4,
        peak: 176,
        work: 120.94,
        distance: null,
        seat: null,
        rom2: null,
        rom1: null,
        chest: null,
        test: null
      }
    )

    await createdSession.end({ echipId, echipData })

    expect(typeof createdSession).to.equal('object')
    expect(createdSession.endedAt).to.not.equal(null)
    expect(createdSession.eagerStrengthMachineDataSets()?.length).to.equal(2)
    await createdSession.delete()
  })
})
