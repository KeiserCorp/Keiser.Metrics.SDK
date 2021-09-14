import { expect } from 'chai'

import { Units } from '../src/constants'
import Metrics from '../src/core'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Profile', function () {
  const userProfile = {
    name: 'Test',
    birthday: '1990-01-01',
    gender: Gender.Male,
    language: 'en',
    units: Units.Imperial
  }

  let metricsInstance: Metrics
  let user: User

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can update profile', async function () {
    const params = { ...userProfile }
    const profile = await user.eagerProfile().update(params)

    expect(profile).to.be.an('object')
    expect(profile.name).to.equal(params.name)
    expect(profile.birthday).to.equal(params.birthday)
    expect(profile.gender).to.equal(params.gender)
    expect(profile.language).to.equal(params.language)
    expect(profile.units).to.equal(params.units)
  })

  it('can reload profile', async function () {
    const profile = await user.eagerProfile().reload()

    expect(profile).to.be.an('object')
    expect(profile.updatedAt instanceof Date).to.equal(true)
    expect(profile.name).to.equal(userProfile.name)
    expect(profile.birthday).to.equal(userProfile.birthday)
    expect(profile.gender).to.equal(userProfile.gender)
    expect(profile.language).to.equal(userProfile.language)
    expect(profile.units).to.equal(userProfile.units)
  })

  it('can update profile again', async function () {
    const prevUpdatedAt = user.eagerProfile().updatedAt
    const params = {
      name: 'test',
      birthday: '1980-01-01',
      gender: Gender.Male,
      language: null,
      units: null
    }
    const profile = await user.eagerProfile().update(params)

    expect(profile).to.be.an('object')
    expect(profile.updatedAt).to.not.equal(prevUpdatedAt)
    expect(profile.name).to.equal(params.name)
    expect(profile.birthday).to.equal(params.birthday)
    expect(profile.gender).to.equal(params.gender)
    expect(profile.language).to.equal(params.language)
    expect(profile.units).to.equal(params.units)
  })

  it('can subscribe to profile changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const userProfile = user.eagerProfile()
    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      userProfile.onModelChangeEvent.one(e => resolve(e))
    }))

    const params = {
      name: 'test2',
      birthday: '1980-01-01',
      gender: Gender.Male,
      language: null,
      units: null
    }

    await userProfile.update(params)
    expect(userProfile).to.be.an('object')
    expect(userProfile.name).to.equal(params.name)
    expect(userProfile.birthday).to.equal(params.birthday)
    expect(userProfile.gender).to.equal(params.gender)
    expect(userProfile.language).to.equal(params.language)
    expect(userProfile.units).to.equal(params.units)

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.model).to.equal('profile')
    expect(modelChangeEvent.modelId).to.equal(user.id)
    expect(modelChangeEvent.mutation).to.equal('update')
  })
})
