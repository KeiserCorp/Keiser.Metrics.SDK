import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, ActionPreventedError, UnknownEntityError } from '../src/error'
import { Session, SessionSorting } from '../src/models/session'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { generateMSeriesDataSet } from './utils/dummy'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Session', function () {
  let metricsInstance: Metrics
  let user: User
  let createdSession: Session

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(ActionPreventedError.code)
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
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })

  it('can subscribe to session changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const session = (await user.startSession({ forceEndPrevious: false })).session

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = session.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update' && e.id === session.id) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await new Promise(resolve => setTimeout(() => resolve(null), 1000))
    await session.end()

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('update')
    expect(modelChangeEvent.id).to.equal(session.id)

    await session.delete()
  })

  it('can subscribe to session list changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const sessions = await user.getSessions({ limit: 1 })

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = sessions.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'create' && (sessions.length === 0 || e.id !== sessions[0].id)) {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const session = (await user.startSession({ forceEndPrevious: false })).session

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    expect(modelListChangeEvent.mutation).to.equal('create')
    expect(modelListChangeEvent.id).to.equal(session.id)

    await session.delete()
  })

  it('can subscribe to session changes and observe nested associations', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const session = (await user.startSession({ forceEndPrevious: false })).session

    const modelListChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = session.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update' && e.name === 'mSeriesDataSet') {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    const genDataSet = generateMSeriesDataSet()
    const mSeriesDataSet = await user.createMSeriesDataSet({
      sessionId: session.id,
      source: 'test',
      machineType: 'm3i',
      ordinalId: 0,
      buildMajor: 6,
      buildMinor: 30,
      mSeriesDataPoints: genDataSet
    })

    const modelListChangeEvent = await modelListChangeEventPromise
    expect(modelListChangeEvent).to.be.an('object')
    /** @todo Once issues with M Series Data set creation are resolve this should be changed to `create` */
    expect(modelListChangeEvent.mutation).to.equal('update')
    expect(modelListChangeEvent.id).to.equal(mSeriesDataSet.id)

    await mSeriesDataSet.delete()
  })
})
