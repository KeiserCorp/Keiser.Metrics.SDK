import { SubscribableModel } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityRelationship } from './facilityRelationship'

export enum FingerprintReaderModel {
  GT521F5 = 'gt521f5'
}

export interface FingerprintData {
  facilityRelationshipId: number
  updatedAt: string
  fingerprintReaderModel: FingerprintReaderModel
  template: Uint8Array
  hash: string
  facilityRelationship?: FacilityRelationship
}

export interface FingerprintResponse extends AuthenticatedResponse {
  fingerprint: FingerprintData
}

export class Fingerprint extends SubscribableModel {
  private _fingerprintData: FingerprintData

  constructor (fingerprintData: FingerprintData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._fingerprintData = fingerprintData
  }

  private setFingerprintData (fingerprintData: FingerprintData) {
    this._fingerprintData = fingerprintData
  }

  protected get subscribeParameters () {
    return { model: 'fingerprint', id: this.facilityRelationshipId }
  }

  async reload () {
    const { fingerprint } = await this.action('fingerprint:show', { facilityRelationshipId: this._fingerprintData.facilityRelationshipId }) as FingerprintResponse
    this.setFingerprintData(fingerprint)
    return this
  }

  async update (params: { template: Uint8Array, fingerprintReaderModel: FingerprintReaderModel }) {
    const { fingerprint } = await this.action('fingerprint:update', { fingerprintReaderModel: params.fingerprintReaderModel, template: JSON.stringify(Array.from(params.template)), facilityRelationshipId: this._fingerprintData.facilityRelationshipId }) as FingerprintResponse
    this.setFingerprintData(fingerprint)
    return this
  }

  async delete () {
    await this.action('fingerprint:delete', { facilityRelationshipId: this._fingerprintData.facilityRelationshipId })
  }

  get facilityRelationshipId () {
    return this._fingerprintData.facilityRelationshipId
  }

  get updatedAt () {
    return new Date(this._fingerprintData.updatedAt)
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
