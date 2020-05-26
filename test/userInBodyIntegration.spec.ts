import { expect } from 'chai'
import Metrics from '../src'
import { ActionPreventedError, UnknownEntityError } from '../src/error'
import { PrivilegedFacility } from '../src/models/facility'
import { FacilityEmployeeRole, FacilityUserRelationship, FacilityUserRelationshipSorting } from '../src/models/facilityRelationship'
import { DemoEmail, DemoPassword, DevRestEndpoint, DevSocketEndpoint } from './constants'

describe('User InBody Integration', function () {
  let metricsInstance: Metrics
  let facility: PrivilegedFacility
  let facilityRelationship: FacilityUserRelationship
  const newUserEmailAddress = [...Array(50)].map(i => (~~(Math.random() * 36)).toString(36)).join('') + '@fake.com'

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    const userSession = await metricsInstance.authenticateWithCredentials({ email: DemoEmail, password: DemoPassword })
    facility = (await userSession.user.getFacilityEmploymentRelationships())[0].facility
    await facility.setActive()
    facilityRelationship = (await facility.getMemberRelationships())[0]
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can try to get InBody integration', async function () {
    let extError

    try {
      await facilityRelationship.getInBodyIntegration()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })

  it('can try to create InBody integration', async function () {
    let extError

    try {
      await facilityRelationship.createInBodyIntegration({ userToken: '1234567890' })
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(ActionPreventedError.code)
  })

})
