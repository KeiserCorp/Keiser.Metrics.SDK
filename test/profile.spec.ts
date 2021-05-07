import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { Units } from '../src/constants'
import { Gender } from '../src/models/profile'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { CreateUser } from './persistent/user'

describe('Profile', function () {
  let metricsInstance: MetricsSSO
  let userSession: UserSession
  let user: User
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  const userProfile = {
    name: 'Test',
    birthday: '1990-01-01',
    gender: Gender.Male,
    language: 'en',
    units: Units.Imperial
  }

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await CreateUser(metricsInstance, newUserEmail)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
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

  it('can update profile', async function () {
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
})
