import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { User } from '../src/models/user'
import { UserFacilityRelationship } from '../src/models/userFacilityRelationship'

describe('User to Facility Relationship', function () {
  let metricsInstance: Metrics
  let session: Session
  let user: User
  let facilityRelationship: UserFacilityRelationship

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    user = session.user
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get list of member facility relationships', async function () {
    const facilityRelationships = await user.getFacilityMembershipRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    facilityRelationship = facilityRelationships[0]
  })

  it('can get list of employer facility relationships', async function () {
    const facilityRelationships = await user.getFacilityEmploymentRelationships()

    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    expect(facilityRelationships[0].employeeRole).to.equal('admin')
    facilityRelationship = facilityRelationships[0]
  })

  it('can access facility instance', async function () {
    expect(typeof facilityRelationship.facility).to.equal('object')
    expect(typeof facilityRelationship.facility?.id).to.equal('number')
  })

  it('can reload facility relationships', async function () {
    facilityRelationship = await facilityRelationship.reload()

    expect(typeof facilityRelationship).to.equal('object')
    expect(facilityRelationship.employeeRole).to.equal('admin')
  })

  it('can try to delete facility relationships', async function () {
    let extError

    try {
      await facilityRelationship.delete()
    } catch (error) {
      extError = error
    }

    expect(typeof extError).to.not.equal('undefined')
    expect(extError.error.code).to.equal(626)
  })

})
