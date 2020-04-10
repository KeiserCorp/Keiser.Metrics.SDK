import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import Metrics from '../src'
import { Session } from '../src/session'
import { Facility } from '../src/models/facility'

describe('Facility', function () {
  let metricsInstance: Metrics
  let session: Session
  let facility: Facility | undefined

  before(async function () {
    metricsInstance = new Metrics({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateWithCredentials(DemoEmail, DemoPassword)
    facility = (await session.user.getFacilityMembershipRelationships())[0].facility
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('has facilitiy properties', async function () {
    expect(typeof facility).to.equal('object')
    expect(typeof facility?.id).to.equal('number')
  })

  it('facility has facility profile', async function () {
    if (facility) {
      expect(typeof facility).to.equal('object')
      expect(typeof facility.facilityProfile).to.equal('object')
      expect(typeof facility.facilityProfile?.name).to.equal('string')
    }
  })

  // Requires facility set in session state
  // it('can get updated facility profile', async function () {
  //   if (facility) {
  //     const facilityProfile = await facility.getFacilityProfile()
  //     expect(typeof facilityProfile).to.equal('object')
  //     expect(typeof facilityProfile.name).to.equal('string')
  //   }
  // })

})
