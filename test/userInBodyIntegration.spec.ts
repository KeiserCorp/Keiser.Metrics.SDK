import { expect } from 'chai'
import Metrics from '../src'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityMemberUser } from '../src/models/user'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User InBody Integration', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let user: FacilityMemberUser

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    const facilities = await userSession.user.getFacilityEmploymentRelationships()
    if (typeof facilities[0]?.facility !== 'undefined') {
      facility = facilities[0].facility
      await facility.setActive()
      user = (await facility.getMemberRelationships())[0].user
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
