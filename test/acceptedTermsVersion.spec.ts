import { expect } from 'chai'

import Metrics from '../src/core'
import { AcceptedTermsVersion } from '../src/models/acceptedTermsVersion'
import { User } from '../src/models/user'
import { createNewUserSession, getMetricsInstance } from './utils/fixtures'

describe('Accepted Terms Version', function () {
  const revision = '2020-01-01'

  let metricsInstance: Metrics
  let user: User
  let acceptedTermsVersion: AcceptedTermsVersion

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await createNewUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    await user.delete()
    metricsInstance?.dispose()
  })

  it('can create accepted terms version', async function () {
    acceptedTermsVersion = await user.createAcceptedTermsVersion({ revision })

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
    expect(acceptedTermsVersion.revision).to.equal('2020-02-02')
  })
})
