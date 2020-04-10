import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { FacilityProfileData, FacilityProfile, FacilityProfileResponse } from './facilityProfile'

export interface FacilityData {
  id: number
  licensedUntil: string
  facilityProfile?: FacilityProfileData
  facilityConfiguration?: any
  facilityLicenses?: any
}

export interface FacilityResponse extends AuthenticatedResponse {
  facility: FacilityData
}

export interface FacilityListResponse extends AuthenticatedResponse {
  facilities: FacilityData[]
}

export class Facility extends Model {
  protected _facilityData: FacilityData

  constructor (facilityData: FacilityData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityData = facilityData
  }

  protected setFacilityData (facilityData: FacilityData) {
    Object.assign(this._facilityData, facilityData)
  }

  get id () {
    return this._facilityData.id
  }

  get facilityProfile () {
    return this._facilityData.facilityProfile ? new FacilityProfile(this._facilityData.facilityProfile, this.sessionHandler) : undefined
  }
}

export class PrivilegedFacility extends Facility {
  constructor (facilityData: FacilityData, sessionHandler: SessionHandler) {
    super(facilityData, sessionHandler)
  }

  get licensedUntil () {
    return new Date(this._facilityData.licensedUntil)
  }

  async getFacilityProfile () {
    const { facilityProfile } = await this.action('facilityProfile:show') as FacilityProfileResponse
    return facilityProfile
  }
}
