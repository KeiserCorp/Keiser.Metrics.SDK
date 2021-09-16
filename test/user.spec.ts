import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, BlacklistTokenError, UnknownEntityError } from '../src/error'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { randomLetterSequence } from './utils/dummy'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('User', function () {
  let metricsInstance: Metrics
  let user: User

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can access user profile properties', async function () {
    const profile = user.eagerProfile()
    expect(profile).to.be.an('object')
    expect(profile.name).to.be.a('string')
  })

  it('can reload user', async function () {
    const profile = (await user.reload()).eagerProfile()

    expect(profile).to.be.an('object')
    expect(profile.name).to.be.a('string')
  })

  it('can change user password', async function () {
    const newPassword = 'p@$$w0r|)'
    await user.changePassword({ password: newPassword })
  })

  it('can subscribe to associated model changes', async function () {
    this.timeout(10000)

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = user.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update' && e.name === 'profile') {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    await user.eagerProfile().update({ name: randomLetterSequence(20) })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.name).to.equal('profile')
    expect(modelChangeEvent.mutation).to.equal('update')
  })

  it('can delete user', async function () {
    let extError

    await user.delete()

    try {
      await user.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.be.oneOf([UnknownEntityError.code, BlacklistTokenError.code])
  })
})
