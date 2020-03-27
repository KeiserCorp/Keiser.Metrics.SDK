import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { User } from '../src/models/user'
import { AcceptedTermsVersion } from '../src/models/acceptedTermsVersion'

describe('Accepted Terms Version', function () {
  let metricsInstance: Metrics
  let session: Session
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
    session = await metricsInstance.createUser(newUserEmail, 'password')
    user = session.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('is not populated on first load', async function () {
    expect(typeof user.acceptedTermsVersion).to.equal('undefined')
  })

  it('can create accepted terms version', async function () {
    acceptedTermsVersion = await user.createAcceptedTermsVersion('2020-01-01')

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
