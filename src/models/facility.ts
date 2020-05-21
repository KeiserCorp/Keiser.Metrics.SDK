import { ListMeta, Model, UserModelList  } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityLicenseData } from './facilityLicense'
import { FacilityProfile, FacilityProfileData } from './facilityProfile'
import { FacilityUserRelationshipListResponse, FacilityUserRelationships, FacilityUserRelationshipSorting } from './facilityRelationship'

export const enum FacilitySorting {
  ID = 'id',
  Name = 'name'
}

export interface FacilityData {
  id: number
  licensedUntil: string
  facilityProfile?: FacilityProfileData
  facilityConfiguration?: any
  facilityLicenses?: FacilityLicenseData
}

export interface FacilityResponse extends AuthenticatedResponse {
  facility: FacilityData
}

export interface FacilityListResponse extends AuthenticatedResponse {
  facilities: FacilityData[],
  facilitiesMeta: FacilityListResponseMeta
}

export interface FacilityListResponseMeta extends ListMeta {
  name: string | undefined
  phone: string | undefined
  address: string | undefined
  city: string | undefined
  postcode: string | undefined
  state: string | undefined
  country: string | undefined
  sort: FacilitySorting
}

export class Facilities extends UserModelList<Facility, FacilityData, FacilityListResponseMeta> {
  constructor (facilities: FacilityData[], facilitiesMeta: FacilityListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(Facility, facilities, facilitiesMeta, sessionHandler, userId)
  }
}

export class Facility extends Model {
  protected _facilityData: FacilityData

  constructor (facilityData: FacilityData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityData = facilityData
  }

  protected setFacilityData (facilityData: FacilityData) {
    this._facilityData = facilityData
  }

  get id () {
    return this._facilityData.id
  }

  get facilityProfile () {
    return this._facilityData.facilityProfile ? new FacilityProfile(this._facilityData.facilityProfile, this, this.sessionHandler) : undefined
  }
}

export class PrivilegedFacility extends Facility {
  constructor (facilityData: FacilityData, sessionHandler: SessionHandler) {
    super(facilityData, sessionHandler)
  }

  get licensedUntil () {
    return new Date(this._facilityData.licensedUntil)
  }

  get isActive () {
    return this.id === this.sessionHandler.decodedAccessToken?.facility?.id
  }

  async setActive () {
    await this.action('auth:setFacility', { facilityId: this.id, refreshable: this.sessionHandler.refreshToken !== null })
  }

  async getMemberRelationships (options: { name?: string, memberIdentifier?: string, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler, this.id)
  }

  async getEmployeeRelationships (options: { name?: string, employeeRole?: string, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, employee: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler, this.id)
  }
}
