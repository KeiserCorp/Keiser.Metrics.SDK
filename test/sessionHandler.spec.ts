import { expect } from 'chai'

import Metrics from '../src/core'
import { PrivilegedFacility } from '../src/models/facility'
import { User } from '../src/models/user'
import { ModelChangeEvent, UserSession } from '../src/session'
import { IsBrowser } from './utils/constants'
import { randomCharacterSequence, randomEmailAddress } from './utils/dummy'
import { createUserSession, getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Session Handler (Facility)', function () {
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

  it('can access email address', async function () {
    const emailAddress = (await newUser.getEmailAddresses())[0]

    expect(typeof emailAddress).to.equal('object')
    expect(emailAddress.userId).to.equal(newUser.id)

    await emailAddress.reload()
  })

  it('can access height measurement', async function () {
    this.timeout(10000)
    let heightMeasurements = await newUser.getHeightMeasurements()

    const heightMeasurementChangeEventPromise = new Promise<ModelChangeEvent>(resolve => {
      heightMeasurements.onModelChangeEvent.one(e => resolve(e))
    })

    const heightMeasurement = await newUserSession.user.createHeightMeasurement({ source: 'test', takenAt: new Date(), metricHeight: 100 })
    expect(typeof heightMeasurement).to.equal('object')
    expect(heightMeasurement.metricHeight).to.equal(100)

    if (IsBrowser) {
      const heightMeasurementChangeEvent = await heightMeasurementChangeEventPromise
      expect(heightMeasurementChangeEvent.id).to.equal(heightMeasurement.id)
    }

    heightMeasurements = await newUser.getHeightMeasurements()
    expect(heightMeasurements.length).to.equal(1)
    await heightMeasurements[0].reload()
  })

  it('can access weight measurement', async function () {
    this.timeout(10000)
    let weightMeasurements = await newUser.getWeightMeasurements()

    const weightMeasurementChangeEventPromise = new Promise<ModelChangeEvent>(resolve => {
      weightMeasurements.onModelChangeEvent.one(e => resolve(e))
    })

    const weightMeasurement = await newUserSession.user.createWeightMeasurement({ source: 'test', takenAt: new Date(), metricWeight: 100 })
    expect(typeof weightMeasurement).to.equal('object')
    expect(weightMeasurement.metricWeight).to.equal(100)

    if (IsBrowser) {
      const weightMeasurementChangeEvent = await weightMeasurementChangeEventPromise
      expect(weightMeasurementChangeEvent.id).to.equal(weightMeasurement.id)
    }

    weightMeasurements = await newUser.getWeightMeasurements()
    expect(weightMeasurements.length).to.equal(1)
    await weightMeasurements[0].reload()
  })
})
