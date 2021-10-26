import { FacilityListMeta, SubscribableModel, SubscribableModelList, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData, PrivilegedFacility } from './facility'
import { Fingerprint, FingerprintReaderModel, FingerprintResponse } from './fingerprint'
import { Session, SessionData } from './session'
import { FacilityEmployeeUser, FacilityMemberUser, User, UserData } from './user'

export enum UserFacilityRelationshipSorting {
  ID = 'id',
  EmployeeRole = 'employeeRole'
}

export enum FacilityUserRelationshipSorting {
  ID = 'id',
  Name = 'name',
  MemberIdentifier = 'memberIdentifier',
  EmployeeRole = 'employeeRole'
}

export enum FacilityEmployeeRole {
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

export interface UserFacilityRelationshipListResponseMeta extends UserListMeta {
  member?: boolean
  employee?: boolean
  employeeRole?: FacilityEmployeeRole
  sort: UserFacilityRelationshipSorting
}

export interface FacilityUserRelationshipListResponse extends AuthenticatedResponse {
  facilityRelationships: FacilityRelationshipData[]
  facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta
}

export interface FacilityUserRelationshipListResponseMeta extends FacilityListMeta {
  member?: boolean
  employee?: boolean
  name?: string
  memberIdentifier?: string
  employeeRole?: FacilityEmployeeRole
  includeSession?: boolean
  sort: FacilityUserRelationshipSorting
}

export abstract class FacilityRelationship extends SubscribableModel {
  protected _facilityRelationshipData: FacilityRelationshipData

  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityRelationshipData = facilityRelationshipData
  }

  protected setFacilityRelationshipData (facilityRelationshipData: FacilityRelationshipData) {
    this._facilityRelationshipData = facilityRelationshipData
  }

  ejectData () {
    return this.eject(this._facilityRelationshipData)
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

  async getFingerprint () {
    const { fingerprint } = await this.action('fingerprint:show', { facilityRelationshipId: this.id }) as FingerprintResponse
    return new Fingerprint(fingerprint, this.sessionHandler)
  }

  async createFingerprint (params: { template: Uint8Array, fingerprintReaderModel: FingerprintReaderModel}) {
    const { fingerprint } = await this.action('fingerprint:update', { fingerprintReaderModel: params.fingerprintReaderModel, template: JSON.stringify(Array.from(params.template)), facilityRelationshipId: this.id }) as FingerprintResponse
    return new Fingerprint(fingerprint, this.sessionHandler)
  }
}

export class UserFacilityMemberRelationships extends SubscribableModelList<UserFacilityMemberRelationship, FacilityRelationshipData, UserFacilityRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(UserFacilityMemberRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'facilityRelationship', actionOverride: 'facilityRelationship:userSubscribe' }
  }
}

export class UserFacilityEmployeeRelationships extends SubscribableModelList<UserFacilityEmployeeRelationship, FacilityRelationshipData, UserFacilityRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: UserFacilityRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(UserFacilityEmployeeRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'facilityRelationship', actionOverride: 'facilityRelationship:userSubscribe' }
  }
}

export class UserFacilityRelationship extends FacilityRelationship {
  protected get subscribeParameters () {
    return { model: 'facilityRelationship', id: this.id, userId: this.userId, actionOverride: 'facilityRelationship:userSubscribe' }
  }

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

export class FacilityUserRelationships extends SubscribableModelList<FacilityUserRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'facilityRelationship', actionOverride: 'facilityRelationship:facilitySubscribe' }
  }
}

export class FacilityUserMemberRelationships extends SubscribableModelList<FacilityUserMemberRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserMemberRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'facilityRelationship', actionOverride: 'facilityRelationship:facilitySubscribe' }
  }
}

export class FacilityUserEmployeeRelationships extends SubscribableModelList<FacilityUserEmployeeRelationship, FacilityRelationshipData, FacilityUserRelationshipListResponseMeta> {
  constructor (facilityRelationships: FacilityRelationshipData[], facilityRelationshipsMeta: FacilityUserRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityUserEmployeeRelationship, facilityRelationships, facilityRelationshipsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'facilityRelationship', actionOverride: 'facilityRelationship:facilitySubscribe' }
  }
}

export class FacilityUserRelationship extends FacilityRelationship {
  protected get subscribeParameters () {
    return { model: 'facilityRelationship', id: this.id, actionOverride: 'facilityRelationship:facilitySubscribe' }
  }

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
