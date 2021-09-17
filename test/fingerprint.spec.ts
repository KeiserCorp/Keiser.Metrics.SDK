import { expect } from 'chai'

import Metrics from '../src'
import { UnknownEntityError } from '../src/error'
import { Fingerprint, FingerprintReaderModel } from '../src/models/fingerprint'
import { User } from '../src/models/user'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Fingerprint', function () {
  const fingerprintTemplate = Array(498).fill(0)

  let metricsInstance: Metrics
  let user: User
  let fingerprint: Fingerprint

  before(async function () {
    metricsInstance = getMetricsInstance()
    const userSession = await getDemoUserSession(metricsInstance)
    user = userSession.user
  })

  after(async function () {
    metricsInstance?.dispose()
  })

  it('can create new fingerprint', async function () {
    const facilityRelationships = await user.getFacilityMembershipRelationships()
    expect(Array.isArray(facilityRelationships)).to.equal(true)
    expect(typeof facilityRelationships[0]).to.equal('object')
    const facilityRelationship = facilityRelationships[0]
    expect(typeof facilityRelationship).to.equal('object')

    fingerprint = await facilityRelationship.createFingerprint({ template: fingerprintTemplate, fingerprintReaderModel: FingerprintReaderModel.GT521F5 })

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.facilityRelationshipId).to.equal(facilityRelationship.id)
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(0)
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can update fingerprint', async function () {
    fingerprint = await fingerprint.update({ template: Array(498).fill(1), fingerprintReaderModel: FingerprintReaderModel.GT521F5 })

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(1)
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can reload fingerprint', async function () {
    fingerprint = await fingerprint.reload()

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(1)
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can delete fingerprint', async function () {
    let extError

    await fingerprint.delete()

    try {
      await fingerprint.reload()
    } catch (error) {
      extError = error
    }

    expect(extError).to.be.an('error')
    expect(extError.code).to.equal(UnknownEntityError.code)
  })
})
