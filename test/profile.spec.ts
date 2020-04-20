import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import Metrics from '../src'
import { UserSession } from '../src/session'
import { User } from '../src/models/user'
import { Gender } from '../src/models/profile'

describe('Profile', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    userSession = await metricsInstance.createUser({ email: newUserEmail, password: 'password' })
    user = userSession.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can reload profile', async function () {
    const profile = await user.profile.reload()

    expect(profile).to.be.an('object')
    expect(profile.updatedAt instanceof Date).to.equal(true)
    expect(profile.name).to.equal(null)
    expect(profile.birthday).to.equal(null)
    expect(profile.gender).to.equal(null)
    expect(profile.language).to.equal(null)
    expect(profile.units).to.equal(null)
  })

  it('can update profile', async function () {
    const prevUpdatedAt = user.profile.updatedAt
    const params = {
      name: 'test',
      birthday: '1980-01-01',
      gender: Gender.Male,
      language: null,
      units: null
    }
    const profile = await user.profile.update(params)

    expect(profile).to.be.an('object')
    expect(profile.updatedAt).to.not.equal(prevUpdatedAt)
    expect(profile.name).to.equal(params.name)
    expect(profile.birthday).to.equal(params.birthday)
    expect(profile.gender).to.equal(params.gender)
    expect(profile.language).to.equal(params.language)
    expect(profile.units).to.equal(params.units)
  })

})
