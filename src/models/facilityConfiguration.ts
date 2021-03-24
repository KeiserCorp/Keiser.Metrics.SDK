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

  public ejectData () {
    return { ...this._facilityConfigurationData }
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

export class StaticFacilityConfiguration {
  private readonly _facilityConfigurationData: FacilityConfigurationData

  constructor (facilityConfigurationData: FacilityConfigurationData) {
    this._facilityConfigurationData = facilityConfigurationData
  }

  public ejectData () {
    return { ...this._facilityConfigurationData }
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
