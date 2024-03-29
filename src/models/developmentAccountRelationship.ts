import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum DevelopmentAccountRelationshipSorting {
  ID = 'id',
  UserId = 'userId',
  Role = 'role',
}

export enum DevelopmentAccountRelationshipRole {
  Owner = 'owner',
  Developer = 'developer',
}

export interface DevelopmentAccountRelationshipData {
  id: number
  userId: number
  developmentAccountId: number
  role: DevelopmentAccountRelationshipRole
}

export interface DevelopmentAccountRelationshipResponse extends AuthenticatedResponse {
  developmentAccountRelationship: DevelopmentAccountRelationshipData
}

export interface DevelopmentAccountRelationshipListResponse extends AuthenticatedResponse {
  developmentAccountRelationships: DevelopmentAccountRelationshipData[]
  developmentAccountRelationshipsMeta: DevelopmentAccountRelationshipListResponseMeta
}

export interface DevelopmentAccountRelationshipListResponseMeta extends ListMeta {
  developmentAccountId: number
  sort: DevelopmentAccountRelationshipSorting
}

export class DevelopmentAccountRelationships extends ModelList<DevelopmentAccountRelationship, DevelopmentAccountRelationshipData, DevelopmentAccountRelationshipListResponseMeta> {
  constructor (developmentAccountRelationships: DevelopmentAccountRelationshipData[], developmentAccountRelationshipMeta: DevelopmentAccountRelationshipListResponseMeta, sessionHandler: SessionHandler) {
    super(DevelopmentAccountRelationship, developmentAccountRelationships, developmentAccountRelationshipMeta, sessionHandler)
  }
}

export class DevelopmentAccountRelationship extends Model {
  protected _developmentAccountRelationshipData: DevelopmentAccountRelationshipData

  constructor (developmentAccountRelationshipData: DevelopmentAccountRelationshipData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._developmentAccountRelationshipData = developmentAccountRelationshipData
  }

  protected setDevelopmentAccountRelationship (developmentAccountRelationshipData: DevelopmentAccountRelationshipData) {
    this._developmentAccountRelationshipData = developmentAccountRelationshipData
  }

  async update (params: { role: DevelopmentAccountRelationshipRole }) {
    const { developmentAccountRelationship } = (await this.action('developmentAccountRelationship:update', { ...params, id: this.id, developmentAccountId: this.developmentAccountId })) as DevelopmentAccountRelationshipResponse
    this.setDevelopmentAccountRelationship(developmentAccountRelationship)
    return this
  }

  async delete () {
    await this.action('developmentAccountRelationship:delete', { id: this.id, developmentAccountId: this.developmentAccountId })
  }

  async reload () {
    const { developmentAccountRelationship } = await this.action('developmentAccountRelationship:show', { id: this.id }) as DevelopmentAccountRelationshipResponse
    this.setDevelopmentAccountRelationship(developmentAccountRelationship)
    return this
  }

  ejectData () {
    return this.eject(this._developmentAccountRelationshipData)
  }

  get id () {
    return this._developmentAccountRelationshipData.id
  }

  get userId () {
    return this._developmentAccountRelationshipData.userId
  }

  get developmentAccountId () {
    return this._developmentAccountRelationshipData.developmentAccountId
  }

  get role () {
    return this._developmentAccountRelationshipData.role
  }
}
