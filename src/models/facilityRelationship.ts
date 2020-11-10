import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData, PrivilegedFacility } from './facility'
import { Session, SessionData } from './session'
import { FacilityEmployeeUser, FacilityMemberUser, User, UserData } from './user'

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

export const enum FacilityEmployeeRole {
  Admin = 'admin',
  CustomerSupport = 'customerSupport',
  Trainer = 'trainer',
  FrontDesk = 'frontDesk',
  Maintenance = 'maintenance'
}

export interface FacilitySessionUserData extends UserData {
  sessions?: SessionData[]
}

export interface FacilityRelationshipData {
  id: number
  userId: number
  facilityId: number
  member: boolean
  memberIdentifier: string | null
  hasSecretSet: boolean
  employeeRole: FacilityEmployeeRole | null
  facility?: FacilityData
  user: FacilitySessionUserData
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
  employeeRole?: FacilityEmployeeRole
  sort: UserFacilityRelationshipSorting
}

export interface FacilityUserRelationshipListResponse extends AuthenticatedResponse {
  facilityRelationships: FacilityRelationshipData[]
  facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta
}

export interface FacilityUserRelationshipListResponseMeta extends ListMeta {
  member?: boolean
  employee?: boolean
  name?: string
  memberIdentifier?: string
  employeeRole?: FacilityEmployeeRole
  includeSession?: boolean
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

export class UserFacilityMemberRelationships extends ModelList<UserFacilityMemberRelationship, FacilityRelationshipData, UserFacilityRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(UserFacilityMemberRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class UserFacilityEmployeeRelationships extends ModelList<UserFacilityEmployeeRelationship, FacilityRelationshipData, UserFacilityRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(UserFacilityEmployeeRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class UserFacilityRelationship extends FacilityRelationship {
  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberSecret: string }) {
    const { facilityRelationship } = await this.action('facilityRelationship:userUpdate', { ...params, userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:userDelete', { userId: this.userId, id: this.id })
  }
}

export class UserFacilityMemberRelationship extends UserFacilityRelationship {
  eagerFacility () {
    if (typeof this._facilityRelationshipData.facility === 'undefined') {
      return undefined
    }
    return new Facility(this._facilityRelationshipData.facility, this.sessionHandler)
  }
}

export class UserFacilityEmployeeRelationship extends UserFacilityRelationship {
  eagerFacility () {
    if (typeof this._facilityRelationshipData.facility === 'undefined') {
      return undefined
    }
    return new PrivilegedFacility(this._facilityRelationshipData.facility, this.sessionHandler)
  }
}

export class FacilityUserMemberRelationships extends ModelList<FacilityUserMemberRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserMemberRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class FacilityUserEmployeeRelationships extends ModelList<FacilityUserEmployeeRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserEmployeeRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }
}

export class FacilityUserRelationship extends FacilityRelationship {
  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberIdentifier?: string | null, member?: boolean, employeeRole?: string | null }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityUpdate', { ...params, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:facilityDelete', { id: this.id })
  }

  eagerUser () {
    return new User(this._facilityRelationshipData.user, this.sessionHandler)
  }
}

export class FacilityUserMemberRelationship extends FacilityUserRelationship {
  eagerUser () {
    return new FacilityMemberUser(this._facilityRelationshipData.user, this.sessionHandler, this.id)
  }

  eagerActiveSession () {
    return typeof this._facilityRelationshipData.user.sessions !== 'undefined' && this._facilityRelationshipData.user.sessions.length > 0 ? new Session(this._facilityRelationshipData.user.sessions[0], this.sessionHandler) : undefined
  }
}

export class FacilityUserEmployeeRelationship extends FacilityUserRelationship {
  eagerUser () {
    return new FacilityEmployeeUser(this._facilityRelationshipData.user, this.sessionHandler, this.id)
  }
}
