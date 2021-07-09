import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { FacilityLicense, LicenseType } from '../src/models/facilityLicense'
import { AdminSession } from '../src/session'
import { getDemoUserSession, getMetricsInstance, getMetricsSSOInstance } from './utils/fixtures'

describe('Facility License', function () {
  let metricsInstance: Metrics
  let adminSession: AdminSession
  let createdFacilityLicense: FacilityLicense

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)
    const metricsSSOInstance = getMetricsSSOInstance()
    adminSession = await metricsSSOInstance.elevateUserSession(userSession, { otpToken: '123456' })
    metricsSSOInstance.dispose()
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility licenses', async function () {
    const facilityLicenses = await adminSession.getFacilityLicenses()

    expect(Array.isArray(facilityLicenses)).to.equal(true)
    expect(facilityLicenses[0].accountId).to.equal('2568000')
    expect(facilityLicenses.meta.totalCount).to.be.above(0)
  })

  it('can reload facility licenses', async function () {
    let facilityLicense = (await adminSession.getFacilityLicenses())[0]

    expect(facilityLicense.accountId).to.equal('2568000')
    facilityLicense = await facilityLicense.reload()
    expect(facilityLicense.accountId).to.equal('2568000')
  })

  it('can create facility license', async function () {
    createdFacilityLicense = await adminSession.createFacilityLicense({ term: 5, type: LicenseType.Test })

    expect(createdFacilityLicense.term).to.equal(5)
    expect(createdFacilityLicense.type).to.equal(LicenseType.Test)
  })

  it('can get specific facility license', async function () {
    const facilityLicense = await adminSession.getFacilityLicense({ id: createdFacilityLicense.id })

    expect(facilityLicense.id).to.equal(createdFacilityLicense.id)
    expect(facilityLicense.term).to.equal(createdFacilityLicense.term)
  })

  it('can delete facility license', async function () {
    let extError

    await createdFacilityLicense.delete()

    try {
      await createdFacilityLicense.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
