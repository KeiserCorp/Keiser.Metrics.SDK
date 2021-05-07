import { expect } from 'chai'

import { MetricsSSO } from '../src'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { FacilityMemberUser } from '../src/models/user'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AuthenticatedUser } from './persistent/user'

describe('User InBody Integration', function () {
  let metricsInstance: MetricsSSO
  let user: FacilityMemberUser

  before(async function () {
    metricsInstance = new MetricsSSO({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await AuthenticatedUser(metricsInstance)
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    const facility = facilities[0]?.eagerFacility()
    if (typeof facility !== 'undefined') {
      await facility.setActive()
      user = (await facility.getMemberRelationships())[0].eagerUser()
    }
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can try to get InBody integration', async function () {
    let extError

    try {
      await user.getInBodyIntegration()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

  it('can try to create InBody integration', async function () {
    let extError

    try {
      await user.createInBodyIntegration({ userToken: '1234567890' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(ActionPreventedError.code)
  })
})
