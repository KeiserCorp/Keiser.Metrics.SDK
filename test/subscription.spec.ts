// import { expect } from 'chai'

import Metrics from '../src/core'
import { User } from '../src/models/user'
import { createNewUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Event System', function () {
  let metricsInstance: Metrics
  let user: User
  let demoUser: User

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user

    const demoSession = await getDemoUserSession(metricsInstance)
    demoUser = demoSession.user
  })

  after(async function () {
    await user.delete()
    // metricsInstance?.dispose()
  })

  // it('can update to demo profile', async function () {
  //   const profile = demoUser.eagerProfile()
  //   await profile.update({ name: 'Tested Profile' })
  // })

  // it('can subscribe to user profile', async function () {
  //   const profile = user.eagerProfile()
  //   // const initialProfileName = profile.name
  //   expect(profile.isSubscribed).to.equal(false)
  //   expect(profile.subscriptionKey).to.equal(null)
  //   await profile.subscribe()
  //   expect(profile.isSubscribed).to.equal(true)
  //   expect(profile.subscriptionKey).to.not.equal(null)
  //   await profile.update({ name: 'Test Name' })
  // })

  it('can subscribe to demo profile', async function () {
    const profile = demoUser.eagerProfile()
    const handler = (e: any) => { console.log(e) }
    const unSub1 = profile.onModelChangeEvent.subscribe(handler)
    profile.onModelChangeEvent.subscribe(handler)

    unSub1()

    setTimeout(() => void profile.update({ name: 'Retesting Profile' }), 20000)
  })

  // it('can re-subscribe to user', async function () {
  //   const profile = user.eagerProfile()
  //   await profile.subscribe()
  //   expect(profile.isSubscribed).to.equal(true)
  // })

  // it('can unsubscribe to user profile', async function () {
  //   const profile = user.eagerProfile()
  //   // const initialProfileName = profile.name
  //   expect(profile.isSubscribed).to.equal(false)
  //   expect(profile.subscriptionKey).to.equal(null)
  //   await profile.subscribe()
  //   expect(profile.isSubscribed).to.equal(true)
  //   expect(profile.subscriptionKey).to.not.equal(null)
  //   await profile.update({ name: 'Test Name' })
  //   await profile.unsubscribe()
  //   expect(profile.isSubscribed).to.equal(false)
  //   expect(profile.subscriptionKey).to.equal(null)
  // })
})
