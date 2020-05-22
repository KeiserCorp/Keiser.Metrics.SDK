import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityData } from './facility'
import { FacilityEmployeeRole } from './facilityRelationship'
import { UserData } from './user'

export const enum FacilityInitiatedFacilityRelationshipRequestSorting {
  ID = 'id',
  Name = 'name'
}

export const enum UserInitiatedFacilityRelationshipRequestSorting {
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

export interface FacilityRelationshipRequestListResponseMeta extends ListMeta {
  facilityId: number | undefined
  name: string | undefined
  sort: UserInitiatedFacilityRelationshipRequestSorting
}

export interface FacilityRelationshipRequestListResponse extends AuthenticatedResponse {
  facilityRelationshipRequests: FacilityRelationshipRequestData[]
  facilityRelationshipRequestsMeta: FacilityRelationshipRequestListResponseMeta
}

export class FacilityRelationshipRequest extends Model {
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

export class FacilityInitiatedFacilityRelationshipRequest extends FacilityRelationshipRequest {
  async approve () {
    return this.update({ approval: true })
  }

  async deny () {
    return this.update({ approval: false })
  }

  private async update (params: { approval: boolean}) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:userUpdate', { ...params, id: this.id }) as FacilityRelationshipRequestResponse
    this.setFacilityRelationshipRequestData(facilityRelationshipRequest)
    return this
  }
}

export class UserInitiatedFacilityRelationshipRequest extends FacilityRelationshipRequest {
  async approve (params: {memberIdentifier: string}) {
    return this.update({ ...params, approval: true })
  }

  async deny () {
    return this.update({ approval: false })
  }

  private async update (params: { approval: boolean}) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:facilityUpdate', { ...params, id: this.id }) as FacilityRelationshipRequestResponse
    this.setFacilityRelationshipRequestData(facilityRelationshipRequest)
    return this
  }
}

export class FacilityInitiatedFacilityRelationshipRequests extends ModelList<FacilityInitiatedFacilityRelationshipRequest, FacilityRelationshipRequestData, FacilityRelationshipRequestListResponseMeta> {
  constructor (facilityRelationshipRequests: FacilityRelationshipRequestData[], facilityRelationshipRequestsMeta: FacilityRelationshipRequestListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityInitiatedFacilityRelationshipRequest, facilityRelationshipRequests, facilityRelationshipRequestsMeta, sessionHandler)
  }
}

export class UserInitiatedFacilityRelationshipRequests extends ModelList<UserInitiatedFacilityRelationshipRequest, FacilityRelationshipRequestData, FacilityRelationshipRequestListResponseMeta> {
  constructor (facilityRelationshipRequests: FacilityRelationshipRequestData[], facilityRelationshipRequestsMeta: FacilityRelationshipRequestListResponseMeta, sessionHandler: SessionHandler) {
    super(UserInitiatedFacilityRelationshipRequest, facilityRelationshipRequests, facilityRelationshipRequestsMeta, sessionHandler)
  }
}
