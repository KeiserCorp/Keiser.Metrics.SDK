import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface FacilitySecretData {
  a500AuthorizationKey: string
}

export interface FacilitySecretResponse extends AuthenticatedResponse {
  facilityConfiguration: FacilitySecretData
}

export class A500FacilityConfiguration extends Model {
  private _facilitySecretData: FacilitySecretData

  constructor (facilitySecretData: FacilitySecretData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilitySecretData = facilitySecretData
  }

  private setFacilitySecretData (facilitySecretData: FacilitySecretData) {
    this._facilitySecretData = facilitySecretData
  }

  async reload () {
    const { facilityConfiguration } = await this.action('a500FacilityConfiguration:show') as FacilitySecretResponse
    this.setFacilitySecretData(facilityConfiguration)
    return this
  }

  get a500AuthorizationKey () {
    return this._facilitySecretData.a500AuthorizationKey
  }
}

export interface A500QrData extends FacilitySecretData {
  url: string
}

export interface A500QrDataResponse extends AuthenticatedResponse {
  facilityConfiguration: A500QrData
}

export class A500Qr extends Model {
  private readonly _a500QrData: A500QrData

  constructor (a500QrData: A500QrData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._a500QrData = a500QrData
  }

  get a500AuthorizationKey () {
    return this._a500QrData.a500AuthorizationKey
  }

  get Url () {
    return this._a500QrData.url
  }
}
