import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityMemberUser } from '../src/models/user'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('User InBody Integration', function () {
  let metricsInstance: Metrics
  let user: FacilityMemberUser

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    const privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()
    user = (await privilegedFacility.getMemberRelationships())[0].eagerUser()
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
