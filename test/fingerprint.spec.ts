import { expect } from 'chai'

import Metrics from '../src/core'
import { ActionErrorProperties, UnknownEntityError } from '../src/error'
import { Fingerprint, FingerprintReaderModel } from '../src/models/fingerprint'
import { User } from '../src/models/user'
import { ModelChangeEvent } from '../src/session'
import { IsBrowser } from './utils/constants'
import { randomByte } from './utils/dummy'
import { getDemoUserSession, getMetricsInstance } from './utils/fixtures'

describe('Fingerprint', function () {
  let fingerprintTemplate = (new Uint8Array(498).fill(0)).map(v => randomByte())

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
    expect(fingerprint.template[0]).to.equal(fingerprintTemplate[0])
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can get fingerprint', async function () {
    const facilityRelationship = (await user.getFacilityMembershipRelationships())[0]
    const fingerprint = await facilityRelationship.getFingerprint()

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(fingerprintTemplate[0])
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can update fingerprint', async function () {
    fingerprintTemplate = (new Uint8Array(498).fill(0)).map(v => randomByte())
    fingerprint = await fingerprint.update({ template: fingerprintTemplate, fingerprintReaderModel: FingerprintReaderModel.GT521F5 })

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(fingerprintTemplate[0])
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can reload fingerprint', async function () {
    fingerprint = await fingerprint.reload()

    expect(typeof fingerprint).to.equal('object')
    expect(fingerprint.template).to.not.equal(null)
    expect(fingerprint.template[0]).to.equal(fingerprintTemplate[0])
    expect(fingerprint.hash).to.not.equal(null)
    expect(fingerprint.fingerprintReaderModel).to.equal(FingerprintReaderModel.GT521F5)
  })

  it('can subscribe to fingerprint changes', async function () {
    this.timeout(10000)
    if (!IsBrowser) {
      this.skip()
    }

    const modelChangeEventPromise: Promise<ModelChangeEvent> = (new Promise(resolve => {
      const unsubscribe = fingerprint.onModelChangeEvent.subscribe(e => {
        if (e.mutation === 'update') {
          unsubscribe()
          resolve(e)
        }
      })
    }))

    fingerprintTemplate = (new Uint8Array(498).fill(0)).map(v => randomByte())
    fingerprint = await fingerprint.update({ template: fingerprintTemplate, fingerprintReaderModel: FingerprintReaderModel.GT521F5 })

    const modelChangeEvent = await modelChangeEventPromise
    expect(modelChangeEvent).to.be.an('object')
    expect(modelChangeEvent.mutation).to.equal('update')
  })

  it('can delete fingerprint', async function () {
    let extError

    await fingerprint.delete()

    try {
      await fingerprint.reload()
    } catch (error) {
      if (error instanceof Error) {
        extError = error as ActionErrorProperties
      }
    }

    expect(extError).to.be.an('error')
    expect(extError?.code).to.equal(UnknownEntityError.code)
  })
})
