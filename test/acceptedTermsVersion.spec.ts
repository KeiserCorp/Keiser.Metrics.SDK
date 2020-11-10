import { expect } from 'chai'

import Metrics from '../src'
import { AcceptedTermsVersion } from '../src/models/acceptedTermsVersion'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('Accepted Terms Version', function () {
  let metricsInstance: Metrics
  let userSession: UserSession
  let user: User
  let acceptedTermsVersion: AcceptedTermsVersion
  const newUserEmail = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'
  const revision = '2020-01-01'

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

  it('is not populated on first load', async function () {
    expect(typeof user.eagerAcceptedTermsVersion()).to.equal('undefined')
  })

  it('can create accepted terms version', async function () {
    acceptedTermsVersion = await user.createAcceptedTermsVersion({ revision: '2020-01-01' })

    expect(acceptedTermsVersion).to.be.an('object')
    expect(acceptedTermsVersion.updatedAt instanceof Date).to.equal(true)
    expect(acceptedTermsVersion.revision).to.equal(revision)
  })

  it('can reload accepted terms version', async function () {
    acceptedTermsVersion = await acceptedTermsVersion.reload()

    expect(acceptedTermsVersion).to.be.an('object')
    expect(acceptedTermsVersion.updatedAt instanceof Date).to.equal(true)
    expect(acceptedTermsVersion.revision).to.equal(revision)
  })

  it('can update accepted terms version', async function () {
    const prevUpdatedAt = acceptedTermsVersion.updatedAt
    const params = { revision: '2020-02-02' }
    acceptedTermsVersion = await acceptedTermsVersion.update(params)

    expect(acceptedTermsVersion).to.be.an('object')
    expect(acceptedTermsVersion.updatedAt instanceof Date).to.equal(true)
    expect(acceptedTermsVersion.updatedAt).to.not.equal(prevUpdatedAt)
    expect(acceptedTermsVersion.revision).to.not.equal(revision)
  })
})
