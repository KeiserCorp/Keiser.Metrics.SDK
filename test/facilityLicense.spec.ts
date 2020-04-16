import { expect } from 'chai'
import { DevRestEndpoint, DevSocketEndpoint, DemoEmail, DemoPassword } from './constants'
import { MetricsAdmin } from '../src'
import { AdminSession } from '../src/session'
import { FacilityLicense, LicenseType } from '../src/models/facilityLicense'

describe('Facility License', function () {
  let metricsInstance: MetricsAdmin
  let session: AdminSession
  let createdFacilityLicense: FacilityLicense

  before(async function () {
    metricsInstance = new MetricsAdmin({
      restEndpoint: DevRestEndpoint,
      socketEndpoint: DevSocketEndpoint,
      persistConnection: true
    })
    session = await metricsInstance.authenticateAdminWithCredentials(DemoEmail, DemoPassword, '123456')
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility licenses', async function () {
    const facilityLicenses = await session.facilityLicenses.getFacilityLicenses()

    expect(Array.isArray(facilityLicenses)).to.equal(true)
    expect(facilityLicenses[0].accountId).to.equal('2568000')
  })

  it('can reload facility licenses', async function () {
    let facilityLicense = (await session.facilityLicenses.getFacilityLicenses())[0]

    expect(facilityLicense.accountId).to.equal('2568000')
    facilityLicense = await facilityLicense.reload()
    expect(facilityLicense.accountId).to.equal('2568000')
  })

  it('can create facility license', async function () {
    createdFacilityLicense = await session.facilityLicenses.createFacilityLicense({ term: 5, type: LicenseType.Test })

    expect(createdFacilityLicense.term).to.equal(5)
    expect(createdFacilityLicense.type).to.equal(LicenseType.Test)
  })

  it('can delete facility license', async function () {
    let extError

    await createdFacilityLicense.delete()

    try {
      await createdFacilityLicense.reload()
    } catch (error) {
      extError = error
    }

    expect(typeof extError).to.not.equal('undefined')
    expect(extError.error.code).to.equal(605)
  })
})
