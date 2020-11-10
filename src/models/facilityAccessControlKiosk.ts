import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum PrimaryIdentification {
  UUID = 'uuid',
  MemberIdentifier = 'memberIdentifier',
  EmailAddress = 'emailAddress',
  FullName = 'fullName'
}

export const enum SecondaryIdentification {
  None = 'none',
  UUID = 'uuid',
  MemberIdentifier = 'memberIdentifier',
  YearOfBirth = 'yearOfBirth',
  MemberSecret = 'memberSecret'
}

export interface FacilityAccessControlKioskData {
  kioskModeAllowed: boolean
  primaryIdentification: PrimaryIdentification
  secondaryIdentification: SecondaryIdentification
}

export interface FacilityAccessControlKioskResponse extends AuthenticatedResponse {
  facilityAccessControlKiosk: FacilityAccessControlKioskData
}

export class FacilityAccessControlKiosk extends Model {
  private _facilityAccessControlKioskData: FacilityAccessControlKioskData

  constructor (facilityAccessControlKioskData: FacilityAccessControlKioskData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityAccessControlKioskData = facilityAccessControlKioskData
  }

  private setFacilityAccessControlKioskData (facilityAccessControlKioskData: FacilityAccessControlKioskData) {
    this._facilityAccessControlKioskData = facilityAccessControlKioskData
  }

  async reload () {
    const { facilityAccessControlKiosk } = await this.action('facilityAccessControlKiosk:show') as FacilityAccessControlKioskResponse
    this.setFacilityAccessControlKioskData(facilityAccessControlKiosk)
    return this
  }

  async update (params: {
    kioskModeAllowed: boolean
    primaryIdentification?: PrimaryIdentification
    secondaryIdentification?: SecondaryIdentification
  }) {
    const { facilityAccessControlKiosk } = await this.action('facilityAccessControlKiosk:update', params) as FacilityAccessControlKioskResponse
    this.setFacilityAccessControlKioskData(facilityAccessControlKiosk)
    return this
  }

  get kioskModeAllowed () {
    return this._facilityAccessControlKioskData.kioskModeAllowed
  }

  get primaryIdentification () {
    return this._facilityAccessControlKioskData.primaryIdentification
  }

  get secondaryIdentification () {
    return this._facilityAccessControlKioskData.secondaryIdentification
  }
}
