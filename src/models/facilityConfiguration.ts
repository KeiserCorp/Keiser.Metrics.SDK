import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum CompositionType {
  Numeric = 'numeric',
  Alpha = 'alpha'
}

export interface FacilityConfigurationData {
  memberIdentificationComposition: CompositionType
  memberIdentificationForceLength: boolean
  memberIdentificationLength: number
  memberIdentificationRegex: string
  memberSecretComposition: CompositionType
  memberSecretForceLength: boolean
  memberSecretLength: number
  memberSecretRegex: string
  memberRequireEmail: boolean
}

export interface FacilityConfigurationResponse extends AuthenticatedResponse {
  facilityConfiguration: FacilityConfigurationData
}

export interface A500QrDataResponse extends AuthenticatedResponse {
  qr: string
}
export class A500Qr extends Model {
  private readonly _model: string
  private readonly _type: string
  private readonly _version: string
  private readonly _accessToken: string

  constructor (a500QrData: string, sessionHandler: SessionHandler) {
    super(sessionHandler)
    const data = a500QrData.split(':')
    const [model, type, version] = data[0].split('.')
    this._model = model
    this._type = type
    this._version = version
    this._accessToken = data[1]
  }

  get accessToken () {
    return this._accessToken
  }

  get model () {
    return this._model
  }

  get type () {
    return this._type
  }

  get version () {
    return this._version
  }
}

export class FacilityConfiguration extends Model {
  private _facilityConfigurationData: FacilityConfigurationData

  constructor (facilityConfigurationData: FacilityConfigurationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityConfigurationData = facilityConfigurationData
  }

  private setFacilityConfigurationData (facilityConfigurationData: FacilityConfigurationData) {
    this._facilityConfigurationData = facilityConfigurationData
  }

  async reload () {
    const { facilityConfiguration } = await this.action('facilityConfiguration:show') as FacilityConfigurationResponse
    this.setFacilityConfigurationData(facilityConfiguration)
    return this
  }

  async update (params: {
    memberIdentificationComposition: CompositionType
    memberIdentificationForceLength: boolean
    memberIdentificationLength: number
    memberSecretComposition: CompositionType
    memberSecretForceLength: boolean
    memberSecretLength: number
    memberRequireEmail: boolean
  }) {
    const { facilityConfiguration } = await this.action('facilityConfiguration:update', params) as FacilityConfigurationResponse
    this.setFacilityConfigurationData(facilityConfiguration)
    return this
  }

  get memberIdentificationComposition () {
    return this._facilityConfigurationData.memberIdentificationComposition
  }

  get memberIdentificationForceLength () {
    return this._facilityConfigurationData.memberIdentificationForceLength
  }

  get memberIdentificationLength () {
    return this._facilityConfigurationData.memberIdentificationLength
  }

  get memberIdentificationRegex () {
    return this._facilityConfigurationData.memberIdentificationRegex
  }

  get memberSecretComposition () {
    return this._facilityConfigurationData.memberSecretComposition
  }

  get memberSecretForceLength () {
    return this._facilityConfigurationData.memberSecretForceLength
  }

  get memberSecretLength () {
    return this._facilityConfigurationData.memberSecretLength
  }

  get memberSecretRegex () {
    return this._facilityConfigurationData.memberSecretRegex
  }

  get memberRequireEmail () {
    return this._facilityConfigurationData.memberRequireEmail
  }
}
