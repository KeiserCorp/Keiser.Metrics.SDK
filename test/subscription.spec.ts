import { expect } from 'chai'

import Metrics from '../src/core'
import { Profile } from '../src/models/profile'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { randomCharacterSequence, randomEmailAddress, randomLetterSequence } from './utils/dummy'
import { createNewUserSession, getAuthenticatedUserSession, getMetricsInstance } from './utils/fixtures'

describe('Subscription System', function () {
  let alphaMetricsInstance: Metrics
  let alphaUser: User
  let alphaProfile: Profile

  let betaMetricsInstance: Metrics
  let betaUser: User
  let betaProfile: Profile

  before(async function () {
    if (!IsBrowser) {
      this.skip()
    }

    const params = {
      email: randomEmailAddress(),
      password: randomCharacterSequence(20)
    }
    alphaMetricsInstance = getMetricsInstance()
    const alphaSession = await createNewUserSession(alphaMetricsInstance, params)
    alphaUser = alphaSession.user
    alphaProfile = alphaUser.eagerProfile()

    betaMetricsInstance = getMetricsInstance()
    const betaSession = await getAuthenticatedUserSession(betaMetricsInstance, params)
    betaUser = betaSession.user
    betaProfile = betaUser.eagerProfile()
  })

  after(async function () {
    if (IsBrowser) {
      await alphaUser.delete()
      alphaMetricsInstance?.dispose()
      betaMetricsInstance?.dispose()
    }
  })

  it('can subscribe and receive model change event', async function () {
    this.timeout(10000)

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      alphaProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    await alphaProfile.update({ name: randomLetterSequence(20) })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.model).to.equal('profile')
    expect(modelChangeEvent.modelId).to.equal(alphaUser.id)
    expect(modelChangeEvent.mutation).to.equal('update')
  })

  it('can handle subscribing while disconnected', async function () {
    this.timeout(30000)

    const socketDisconnectEventPromise = new Promise(resolve => {
      const unsubscribe = alphaMetricsInstance.onConnectionChangeEvent.subscribe(e => {
        if (!e.socketConnection) {
          unsubscribe()
          resolve(e)
        }
      })
    })

    const socketReconnectEventPromise = new Promise(resolve => {
      const unsubscribe = alphaMetricsInstance.onConnectionChangeEvent.subscribe(e => {
        if (e.socketConnection) {
          unsubscribe()
          resolve(e)
        }
      })
    })

    void alphaMetricsInstance.action('dev:serverRestart').catch(e => {})
    await socketDisconnectEventPromise

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      alphaProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    await socketReconnectEventPromise

    await alphaProfile.update({ name: randomLetterSequence(20) })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.model).to.equal('profile')
    expect(modelChangeEvent.modelId).to.equal(alphaUser.id)
    expect(modelChangeEvent.mutation).to.equal('update')
  })

  it('can maintain subscription across disconnect', async function () {
    this.timeout(30000)

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      alphaProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    const socketReconnectEventPromise = new Promise(resolve => {
      const unsubscribe = alphaMetricsInstance.onConnectionChangeEvent.subscribe(e => {
        if (e.socketConnection) {
          unsubscribe()
          resolve(e)
        }
      })
    })

    void alphaMetricsInstance.action('dev:serverRestart').catch(e => {})
    await socketReconnectEventPromise

    await alphaProfile.update({ name: randomLetterSequence(20) })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.model).to.equal('profile')
    expect(modelChangeEvent.modelId).to.equal(alphaUser.id)
    expect(modelChangeEvent.mutation).to.equal('update')
  })

  it('can subscribe and receive model change event triggered by another session', async function () {
    this.timeout(10000)

    const alphaModelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      alphaProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    await betaProfile.update({ name: randomLetterSequence(20) })

    const alphaModelChangeEvent = await alphaModelChangeEventPromise
    expect(alphaModelChangeEvent).to.be.an('object')
    expect(alphaModelChangeEvent.model).to.equal('profile')
    expect(alphaModelChangeEvent.modelId).to.equal(alphaUser.id)
    expect(alphaModelChangeEvent.mutation).to.equal('update')

    await alphaProfile.reload()
    expect(alphaProfile.name).to.equal(betaProfile.name)
  })

  it('can unsubscribe to event and still receive change event on another session', async function () {
    this.timeout(10000)
    let capturedEvent: any

    const alphaUnsubscribe = alphaProfile.onModelChangeEvent.subscribe(e => { capturedEvent = e })
    alphaUnsubscribe()

    const betaModelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      betaProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    await betaProfile.update({ name: randomLetterSequence(20) })

    const betaModelChangeEvent = await betaModelChangeEventPromise
    expect(betaModelChangeEvent).to.be.an('object')
    expect(betaModelChangeEvent.model).to.equal('profile')
    expect(betaModelChangeEvent.modelId).to.equal(alphaUser.id)
    expect(betaModelChangeEvent.mutation).to.equal('update')

    expect(typeof capturedEvent).to.equal('undefined')
  })

  it('can unsubscribe to event across all sessions', async function () {
    this.timeout(12000)
    let alphaCapturedEvent: any
    let betaCapturedEvent: any

    const alphaUnsubscribe = alphaProfile.onModelChangeEvent.subscribe(e => { alphaCapturedEvent = e })
    const betaUnsubscribe = betaProfile.onModelChangeEvent.subscribe(e => { betaCapturedEvent = e })

    alphaUnsubscribe()
    betaUnsubscribe()

    await alphaProfile.update({ name: randomLetterSequence(20) })
    await (new Promise(resolve => setTimeout(() => resolve(null), 10000)))

    expect(typeof alphaCapturedEvent).to.equal('undefined')
    expect(typeof betaCapturedEvent).to.equal('undefined')
  })
})
