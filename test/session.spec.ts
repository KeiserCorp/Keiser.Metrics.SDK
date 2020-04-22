import { expect } from 'chai'
import Metrics from '../src'
import { Session } from '../src/models/session'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Session', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  let createdSession: Session

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can list latest sessions', async function () {
    const sessions = await user.getSessions()

    expect(Array.isArray(sessions)).to.equal(true)
  })

  it('can create new session', async function () {
    createdSession = await user.startSession({ forceEndPrevious: true })

    expect(typeof createdSession).to.equal('object')
    expect(Date.now() - createdSession.startedAt.getTime() < 1000).to.equal(true)
    expect(createdSession.endedAt).to.equal(null)
  })

  it('can catch error when creating another new session without ending', async function () {
    let extError

    try {
      await user.startSession({ forceEndPrevious: false })
    } catch (error) {
      extError = error
    }

    expect(typeof extError).to.equal('object')
    expect(extError.error.code).to.equal(625)
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

    expect(typeof extError).to.equal('object')
    expect(extError.error.code).to.equal(605)
  })

})