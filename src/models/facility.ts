import { Units } from '../constants'
import { ListMeta, Model, ModelList  } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityLicenseData } from './facilityLicense'
import { FacilityProfile, FacilityProfileData } from './facilityProfile'
import { FacilityEmployeeRole, FacilityRelationshipResponse, FacilityUserRelationship, FacilityUserRelationshipListResponse, FacilityUserRelationships, FacilityUserRelationshipSorting } from './facilityRelationship'
import { FacilityRelationshipRequest, FacilityRelationshipRequestListResponse, FacilityRelationshipRequestResponse, UserInitiatedFacilityRelationshipRequests, UserInitiatedFacilityRelationshipRequestSorting } from './facilityRelationshipRequest'
import { Gender } from './profile'

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

export class Facilities extends ModelList<Facility, FacilityData, FacilityListResponseMeta> {
  constructor (facilities: FacilityData[], facilitiesMeta: FacilityListResponseMeta, sessionHandler: SessionHandler) {
    super(Facility, facilities, facilitiesMeta, sessionHandler)
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

  async createRelationshipRequest (params: {memberIdentifier?: string}) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:userCreate', { ...params, facilityId: this.id }) as FacilityRelationshipRequestResponse
    return new FacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
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

  async createFacilityUser (params: {email: string, name: string, birthday?: Date, gender?: Gender, language?: string, units?: Units, member?: boolean, memberIdentifier?: string, memberSecret?: string, employeeRole?: string | null}) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityCreate', params) as FacilityRelationshipResponse
    return new FacilityUserRelationship(facilityRelationship, this.sessionHandler)
  }

  async createRelationshipRequest (params: {email: string, member?: boolean, memberIdentifier?: string, employeeRole?: FacilityEmployeeRole | null}) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:facilityCreate', params) as FacilityRelationshipRequestResponse
    return new FacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
  }

  async getRelationshipRequests (options: {memberIdentifier?: string, name?: string, sort?: UserInitiatedFacilityRelationshipRequestSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { facilityRelationshipRequests, facilityRelationshipRequestsMeta } = await this.action('facilityRelationshipRequest:facilityList', options) as FacilityRelationshipRequestListResponse
    return new UserInitiatedFacilityRelationshipRequests(facilityRelationshipRequests, facilityRelationshipRequestsMeta, this.sessionHandler)
  }

  async getMemberRelationships (options: { name?: string, memberIdentifier?: string, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getEmployeeRelationships (options: { name?: string, employeeRole?: FacilityEmployeeRole | null, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, employee: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }
}
