import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData, PrivilegedFacility } from './facility'
import { User, UserData } from './user'

export const enum UserFacilityRelationshipSorting {
  ID = 'id',
  EmployeeRole = 'employeeRole'
}

export const enum FacilityUserRelationshipSorting {
  ID = 'id',
  Name = 'name',
  MemberIdentifier = 'memberIdentifier',
  EmployeeRole = 'employeeRole'
}

export interface FacilityRelationshipData {
  id: number
  userId: number
  facilityId: number
  member: boolean
  memberIdentifier: string | null
  hasSecretSet: boolean
  employeeRole: string | null
  facility?: FacilityData
  user?: UserData
}

export interface FacilityRelationshipResponse extends AuthenticatedResponse {
  facilityRelationship: FacilityRelationshipData
}

export interface UserFacilityRelationshipListResponse extends AuthenticatedResponse {
  facilityRelationships: FacilityRelationshipData[]
  facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta
}

export interface UserFacilityRelationshipListResponseMeta extends ListMeta {
  member: boolean | undefined
  employee: boolean | undefined
  employeeRole: string | undefined
  sort: UserFacilityRelationshipSorting
}

export interface FacilityUserRelationshipListResponse extends AuthenticatedResponse {
  facilityRelationships: FacilityRelationshipData[]
  facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta
}

export interface FacilityUserRelationshipListResponseMeta extends ListMeta {
  member: boolean | undefined
  employee: boolean | undefined
  name: string | undefined
  memberIdentifier: string | undefined
  employeeRole: string | undefined
  sort: FacilityUserRelationshipSorting
}

export class FacilityRelationship extends Model {
  protected _facilityRelationshipData: FacilityRelationshipData

  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityRelationshipData = facilityRelationshipData
  }

  protected setFacilityRelationshipData (facilityRelationshipData: FacilityRelationshipData) {
    this._facilityRelationshipData = facilityRelationshipData
  }

  get id () {
    return this._facilityRelationshipData.id
  }

  get userId () {
    return this._facilityRelationshipData.userId
  }

  get facilityId () {
    return this._facilityRelationshipData.facilityId
  }

  get member () {
    return this._facilityRelationshipData.member
  }

  get memberIdentifier () {
    return this._facilityRelationshipData.memberIdentifier
  }

  get hasSecretSet () {
    return this._facilityRelationshipData.hasSecretSet
  }

  get employeeRole () {
    return this._facilityRelationshipData.employeeRole
  }
}

export class UserFacilityRelationships extends ModelList<UserFacilityRelationship, FacilityRelationshipData, UserFacilityRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(UserFacilityRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class UserFacilityRelationship extends FacilityRelationship {
  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(facilityRelationshipData, sessionHandler)
  }

  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberSecret: string}) {
    const { facilityRelationship } = await this.action('facilityRelationship:userUpdate', { ...params, userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:userDelete', { userId: this.userId, id: this.id })
  }

  get facility () {
    if (typeof this._facilityRelationshipData.facility === 'undefined') {
      return undefined
    }
    if (this._facilityRelationshipData.employeeRole !== null) {
      return new PrivilegedFacility(this._facilityRelationshipData.facility, this.sessionHandler)
    }
    return new Facility(this._facilityRelationshipData.facility, this.sessionHandler)
  }
}

export class FacilityUserRelationships extends ModelList<FacilityUserRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class FacilityUserRelationship extends FacilityRelationship {
  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(facilityRelationshipData, sessionHandler)
  }

  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberIdentifier?: string, member?: boolean, employeeRole?: string}) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityUpdate', { ...params, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:facilityDelete', { id: this.id })
  }

  get user () {
    return this._facilityRelationshipData.user ? new User(this._facilityRelationshipData.user, this.sessionHandler) : undefined
  }
}
