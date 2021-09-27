import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { User } from '../src/models/user'
import { UserSession } from '../src/session'
import { randomCharacterSequence, randomEmailAddress } from './utils/dummy'
import { createUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe.only('Session Handler (Facility)', function () {
  let metricsInstance: Metrics
  let privilegedFacility: PrivilegedFacility
  let newUser: User
  let newUserSession: UserSession

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)

    const relationship = (await userSession.user.getFacilityEmploymentRelationships())[0]
    privilegedFacility = (await relationship.eagerFacility()?.reload()) as PrivilegedFacility
    await privilegedFacility.setActive()

    const email = randomEmailAddress()
    const newUserRelationship = await privilegedFacility.createFacilityMemberUser({ email, name: randomCharacterSequence(26) })
    newUser = newUserRelationship.eagerUser()
    newUserSession = await createUserSession(metricsInstance, { email })
  })

  after(async function () {
    await newUserSession.user.delete()
    metricsInstance?.dispose()
  })

  it('cannot reload height measurement', async function () {
    const heightMeasurement = await newUserSession.user.createHeightMeasurement({ source: 'test', takenAt: new Date(), metricHeight: 100 })

    expect(typeof heightMeasurement).to.equal('object')
    expect(heightMeasurement.metricHeight).to.equal(100)

    const heightMeasurements = await newUser.getHeightMeasurements()
    expect(heightMeasurements.length).to.equal(1)
    await heightMeasurements[0].reload()
  })
})
