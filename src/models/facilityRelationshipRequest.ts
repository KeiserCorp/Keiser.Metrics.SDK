import { FacilityListMeta, ModelList, SubscribableModel, UserListMeta } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityData } from './facility'
import { FacilityEmployeeRole } from './facilityRelationship'
import { UserData } from './user'

export enum FacilityRelationshipRequestSorting {
  ID = 'id',
  Name = 'name'
}

export enum PrivilegedFacilityRelationshipRequestSorting {
  ID = 'id',
  Name = 'name',
  MemberIdentifier = 'memberIdentifier',
  EmployeeRole = 'employeeRole'
}

export interface FacilityRelationshipRequestData {
  id: number
  userId: number
  userApproval: boolean
  facilityId: number
  facilityApproval: boolean
  member: boolean
  memberIdentifier: string | null
  employeeRole: FacilityEmployeeRole | null
  facility?: FacilityData
  user?: UserData
}

export interface FacilityRelationshipRequestResponse extends AuthenticatedResponse {
  facilityRelationshipRequest: FacilityRelationshipRequestData
}

export interface PrivilegedFacilityRelationshipRequestListResponseMeta extends FacilityListMeta {
  name?: string
  sort: PrivilegedFacilityRelationshipRequestSorting
}

export interface FacilityRelationshipRequestListResponseMeta extends UserListMeta {
  name?: string
  sort: FacilityRelationshipRequestSorting
}

export interface PrivilegedFacilityRelationshipRequestListResponse extends AuthenticatedResponse {
  facilityRelationshipRequests: FacilityRelationshipRequestData[]
  facilityRelationshipRequestsMeta: PrivilegedFacilityRelationshipRequestListResponseMeta
}

export interface FacilityRelationshipRequestListResponse extends AuthenticatedResponse {
  facilityRelationshipRequests: FacilityRelationshipRequestData[]
  facilityRelationshipRequestsMeta: FacilityRelationshipRequestListResponseMeta
}

export abstract class BaseFacilityRelationshipRequest extends SubscribableModel {
  protected _facilityRelationshipRequestData: FacilityRelationshipRequestData

  constructor (facilityRelationshipRequestData: FacilityRelationshipRequestData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityRelationshipRequestData = facilityRelationshipRequestData
  }

  protected setFacilityRelationshipRequestData (facilityRelationshipRequestData: FacilityRelationshipRequestData) {
    this._facilityRelationshipRequestData = facilityRelationshipRequestData
  }

  get id () {
    return this._facilityRelationshipRequestData.id
  }

  get userId () {
    return this._facilityRelationshipRequestData.userId
  }

  get userApproval () {
    return this._facilityRelationshipRequestData.userApproval
  }

  get facilityId () {
    return this._facilityRelationshipRequestData.facilityId
  }

  get facilityApproval () {
    return this._facilityRelationshipRequestData.facilityApproval
  }

  get member () {
    return this._facilityRelationshipRequestData.member
  }

  get memberIdentifier () {
    return this._facilityRelationshipRequestData.memberIdentifier
  }

  get employeeRole () {
    return this._facilityRelationshipRequestData.employeeRole
  }
}

export class FacilityRelationshipRequest extends BaseFacilityRelationshipRequest {
  protected get subscribeParameters () {
    return { model: 'facilityRelationshipRequest', id: this.id, userId: this.userId, actionOverride: 'facilityRelationshipRequest:userSubscribe' }
  }

  async approve () {
    return await this.update({ approval: true })
  }

  async deny () {
    return await this.update({ approval: false })
  }

  private async update (params: { approval: boolean }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:userUpdate', { ...params, id: this.id, userId: this.userId }) as FacilityRelationshipRequestResponse
    this.setFacilityRelationshipRequestData(facilityRelationshipRequest)
    return this
  }
}

export class PrivilegedFacilityRelationshipRequest extends BaseFacilityRelationshipRequest {
  protected get subscribeParameters () {
    return { model: 'facilityRelationshipRequest', id: this.id, actionOverride: 'facilityRelationshipRequest:facilitySubscribe' }
  }

  async approve (params: { memberIdentifier: string }) {
    return await this.update({ ...params, approval: true })
  }

  async deny () {
    return await this.update({ approval: false })
  }

  private async update (params: { approval: boolean }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:facilityUpdate', { ...params, id: this.id }) as FacilityRelationshipRequestResponse
    this.setFacilityRelationshipRequestData(facilityRelationshipRequest)
    return this
  }
}

export class FacilityRelationshipRequests extends ModelList<FacilityRelationshipRequest, FacilityRelationshipRequestData, FacilityRelationshipRequestListResponseMeta> {
  constructor (facilityRelationshipRequests: FacilityRelationshipRequestData[], facilityRelationshipRequestsMeta: FacilityRelationshipRequestListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityRelationshipRequest, facilityRelationshipRequests, facilityRelationshipRequestsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'user', parentId: this.meta.userId, model: 'facilityRelationshipRequest', actionOverride: 'facilityRelationshipRequest:userSubscribe' }
  }
}

export class PrivilegedFacilityRelationshipRequests extends ModelList<PrivilegedFacilityRelationshipRequest, FacilityRelationshipRequestData, PrivilegedFacilityRelationshipRequestListResponseMeta> {
  constructor (facilityRelationshipRequests: FacilityRelationshipRequestData[], facilityRelationshipRequestsMeta: PrivilegedFacilityRelationshipRequestListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedFacilityRelationshipRequest, facilityRelationshipRequests, facilityRelationshipRequestsMeta, sessionHandler)
  }

  protected get subscribeParameters () {
    return { parentModel: 'facility', parentId: this.meta.facilityId, model: 'facilityRelationshipRequest', actionOverride: 'facilityRelationshipRequest:facilitySubscribe' }
  }
}
