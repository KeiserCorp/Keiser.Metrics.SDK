import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityRelationship } from './facilityRelationship'

export enum FingerprintReaderModel {
  GT521F5 = 'gt521f5'
}

export interface FingerprintData {
  facilityRelationshipId: number
  updatedAt: Date
  fingerprintReaderModel: FingerprintReaderModel
  template: any
  hash: string
  facilityRelationship: FacilityRelationship
}

export interface FingerprintResponse extends AuthenticatedResponse {
  fingerprint: FingerprintData
}

export class Fingerprint extends Model {
  private _fingerprintData: FingerprintData

  constructor (fingerprintData: FingerprintData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._fingerprintData = fingerprintData
  }

  private setFingerprintData (fingerprintData: FingerprintData) {
    this._fingerprintData = fingerprintData
  }

  async reload () {
    const { fingerprint } = await this.action('fingerprint:show', { userId: this._fingerprintData.facilityRelationship.userId, facilityRelationshipId: this._fingerprintData.facilityRelationshipId }) as FingerprintResponse
    this.setFingerprintData(fingerprint)
    return this
  }

  async update (params: {template: any, fingerprintReaderModel: FingerprintReaderModel }) {
    if (Array.isArray(params.template)) {
      params.template = JSON.stringify(params.template)
    }
    const { fingerprint } = await this.action('fingerprint:update', { ...params, userId: this._fingerprintData.facilityRelationship.userId, facilityRelationshipId: this._fingerprintData.facilityRelationshipId }) as FingerprintResponse
    this.setFingerprintData(fingerprint)
    return this
  }

  async delete () {
    await this.action('fingerprint:delete', { userId: this._fingerprintData.facilityRelationship.userId, facilityRelationshipId: this._fingerprintData.facilityRelationshipId })
  }

  get facilityRelationshipId () {
    return this._fingerprintData.facilityRelationshipId
  }

  get updatedAt () {
    return this._fingerprintData.updatedAt
  }

  get template () {
    return this._fingerprintData.template
  }

  get hash () {
    return this._fingerprintData.hash
  }

  get fingerprintReaderModel () {
    return this._fingerprintData.fingerprintReaderModel
  }
}
