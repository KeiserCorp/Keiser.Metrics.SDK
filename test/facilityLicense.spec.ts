import { expect } from 'chai'

import { MetricsAdmin } from '../src'
import { UnknownEntityError } from '../src/error'
import { FacilityLicense, LicenseType } from '../src/models/facilityLicense'
import { AdminSession } from '../src/session'
import { DevRestEndpoint, DevSocketEndpoint } from './constants'
import { AdminUser } from './persistent/user'

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
    session = await AdminUser(metricsInstance)
  })

  after(function () {
    metricsInstance?.dispose()
  })

  it('can get facility licenses', async function () {
    const facilityLicenses = await session.getFacilityLicenses()

    expect(Array.isArray(facilityLicenses)).to.equal(true)
    expect(facilityLicenses[0].accountId).to.equal('2568000')
    expect(facilityLicenses.meta.totalCount).to.be.above(0)
  })

  it('can reload facility licenses', async function () {
    let facilityLicense = (await session.getFacilityLicenses())[0]

    expect(facilityLicense.accountId).to.equal('2568000')
    facilityLicense = await facilityLicense.reload()
    expect(facilityLicense.accountId).to.equal('2568000')
  })

  it('can create facility license', async function () {
    createdFacilityLicense = await session.createFacilityLicense({ term: 5, type: LicenseType.Test })

    expect(createdFacilityLicense.term).to.equal(5)
    expect(createdFacilityLicense.type).to.equal(LicenseType.Test)
  })

  it('can get specific facility license', async function () {
    const facilityLicense = await session.getFacilityLicense({ id: createdFacilityLicense.id })

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
