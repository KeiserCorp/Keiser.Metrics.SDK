import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { Session, SessionSorting } from '../src/models/session'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('Session', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let user: User
  let createdSession: Session

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await AuthenticatedUser(metricsInstance)
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list latest sessions', async function () {
    this.timeout(5000)

    const sessions = await user.getSessions()

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

  it('can get specific session', async function () {
    const session = await user.getSession({ id: createdSession.id })

    expect(typeof session).to.equal('object')
    expect(session.id).to.equal(createdSession.id)
    expect(session.startedAt.toISOString()).to.equal(createdSession.startedAt.toISOString())
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
})
