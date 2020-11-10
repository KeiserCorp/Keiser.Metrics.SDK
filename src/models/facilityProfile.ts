import { ClientSideActionPrevented } from '../error'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, PrivilegedFacility } from './facility'

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
  protected _facility: Facility

  constructor (facilityProfileData: FacilityProfileData, facility: Facility, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityProfileData = facilityProfileData
    this._facility = facility
  }

  protected setFacilityProfileData (facilityProfileData: FacilityProfileData) {
    this._facilityProfileData = facilityProfileData
  }

  async reload () {
    const { facilityProfile } = await this.action('facilityProfile:show') as FacilityProfileResponse
    this.setFacilityProfileData(facilityProfile)
    return facilityProfile
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

export class PrivilegedFacilityProfile extends FacilityProfile {
  protected _facility: PrivilegedFacility

  constructor (facilityProfileData: FacilityProfileData, facility: PrivilegedFacility, sessionHandler: SessionHandler) {
    super(facilityProfileData, facility, sessionHandler)
    this._facility = facility
  }

  protected setFacilityProfileData (facilityProfileData: FacilityProfileData) {
    this._facilityProfileData = facilityProfileData
  }

  async update (params: {
    name: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    postcode?: string | null
    state?: string | null
    country?: string | null
    website?: string | null
  }) {
    if (!this._facility.isActive) {
      throw new ClientSideActionPrevented({ explanation: 'can only update profile of active facility' })
    }

    const { facilityProfile } = await this.action('facilityProfile:update', params) as FacilityProfileResponse
    this.setFacilityProfileData(facilityProfile)
    return facilityProfile
  }
}
