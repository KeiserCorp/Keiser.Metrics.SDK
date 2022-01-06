import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { DevelopmentAccountRelationshipRole } from './developmentAccountRelationship'

export enum DevelopmentAccountRelationshipRequestSorting {
  ID = 'id',
  DevelopmentAccountId = 'developmentAccountId',
  Email = 'email',
  UserId = 'userId',
  Role = 'role',
}

export interface DevelopmentAccountRelationshipRequestData {
  id: number
  developmentAccountId: number
  userId: number
  displayEmail: string
  role: DevelopmentAccountRelationshipRole
  code?: string
  company: string
}

export interface DevelopmentAccountRelationshipRequestResponse extends AuthenticatedResponse {
  developmentAccountRelationshipRequest: DevelopmentAccountRelationshipRequestData
}

export interface DevelopmentAccountRelationshipRequestListResponse
  extends AuthenticatedResponse {
  developmentAccountRelationshipRequests: DevelopmentAccountRelationshipRequestData[]
  developmentAccountRelationshipRequestsMeta: DevelopmentAccountRelationshipRequestListResponseMeta
}

export interface DevelopmentAccountRelationshipRequestListResponseMeta extends ListMeta {
  developmentAccountId?: number
  userId?: number
  email?: string
  sort: DevelopmentAccountRelationshipRequestSorting
}

export class DevelopmentAccountRelationshipRequests extends ModelList<DevelopmentAccountRelationshipRequest, DevelopmentAccountRelationshipRequestData, DevelopmentAccountRelationshipRequestListResponseMeta> {
  constructor (developmentAccountRelationshipRequests: DevelopmentAccountRelationshipRequestData[], developmentAccountRelationshipRequestMeta: DevelopmentAccountRelationshipRequestListResponseMeta, sessionHandler: SessionHandler) {
    super(DevelopmentAccountRelationshipRequest, developmentAccountRelationshipRequests, developmentAccountRelationshipRequestMeta, sessionHandler)
  }
}

export class DevelopmentAccountRelationshipRequest extends Model {
  protected _developmentAccountRelationshipRequestData: DevelopmentAccountRelationshipRequestData

  constructor (developmentAccountRelationshipRequestData: DevelopmentAccountRelationshipRequestData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._developmentAccountRelationshipRequestData = developmentAccountRelationshipRequestData
  }

  protected setDevelopmentAccountRelationshipRequest (developmentAccountRelationshipRequestData: DevelopmentAccountRelationshipRequestData) {
    this._developmentAccountRelationshipRequestData = developmentAccountRelationshipRequestData
  }

  async reload () {
    const { developmentAccountRelationshipRequest } = await this.action('developmentAccountRelationshipRequest:show', { id: this.id }) as DevelopmentAccountRelationshipRequestResponse
    this.setDevelopmentAccountRelationshipRequest(developmentAccountRelationshipRequest)
    return this
  }

  async delete () {
    await this.action('developmentAccountRelationshipRequest:delete', { id: this.id })
  }

  ejectData () {
    return this.eject(this._developmentAccountRelationshipRequestData)
  }

  get id () {
    return this._developmentAccountRelationshipRequestData.id
  }

  get developmentAccountId () {
    return this._developmentAccountRelationshipRequestData.developmentAccountId
  }

  get userId () {
    return this._developmentAccountRelationshipRequestData.userId
  }

  get displayEmail () {
    return this._developmentAccountRelationshipRequestData.displayEmail
  }

  get role () {
    return this._developmentAccountRelationshipRequestData.role
  }

  get code () {
    return this._developmentAccountRelationshipRequestData.code
  }

  get company () {
    return this._developmentAccountRelationshipRequestData.company
  }
}
