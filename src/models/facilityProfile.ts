import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'

export interface FacilityProfileData {
  name: string | null
  phone: string | null
  address: string | null
  city: string | null
  postcode: string | null
  state: string | null
  country: string | null
  website: string | null
}

export interface FacilityProfileResponse extends AuthenticatedResponse {
  facilityProfile: FacilityProfileData
}

export interface FacilityProfileListResponse extends AuthenticatedResponse {
  facilityProfiles: FacilityProfileData[]
}

export class FacilityProfile extends Model {
  protected _facilityProfileData: FacilityProfileData

  constructor (facilityProfileData: FacilityProfileData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityProfileData = facilityProfileData
  }

  protected setFacilityProfileData (facilityProfileData: FacilityProfileData) {
    Object.assign(this._facilityProfileData, facilityProfileData)
  }

  get name () {
    return this._facilityProfileData.name
  }

  get phone () {
    return this._facilityProfileData.phone
  }

  get address () {
    return this._facilityProfileData.address
  }

  get city () {
    return this._facilityProfileData.city
  }

  get postcode () {
    return this._facilityProfileData.postcode
  }

  get state () {
    return this._facilityProfileData.state
  }

  get country () {
    return this._facilityProfileData.country
  }

  get website () {
    return this._facilityProfileData.website
  }
}
