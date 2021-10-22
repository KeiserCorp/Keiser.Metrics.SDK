import { ListMeta, Model, ModelList } from '../model'
import { Application, ApplicationListResponse, ApplicationResponse, Applications, ApplicationSorting } from '../models/application'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { DevelopmentAccountRelationship, DevelopmentAccountRelationshipListResponse, DevelopmentAccountRelationshipResponse, DevelopmentAccountRelationshipRole, DevelopmentAccountRelationships, DevelopmentAccountRelationshipSorting } from './developmentAccountRelationship'
import { DevelopmentAccountRelationshipRequest, DevelopmentAccountRelationshipRequestListResponse, DevelopmentAccountRelationshipRequestResponse, DevelopmentAccountRelationshipRequests, DevelopmentAccountRelationshipRequestSorting } from './developmentAccountRelationshipRequest'

export enum DevelopmentAccountSorting {
  ID = 'id',
  Company = 'company',
}

export interface DevelopmentAccountData {
  id: number
  company: string
  address: string
  websiteUrl: string
}

export interface DevelopmentAccountResponse extends AuthenticatedResponse {
  developmentAccount: DevelopmentAccountData
}

export interface DevelopmentAccountListResponse extends AuthenticatedResponse {
  developmentAccounts: DevelopmentAccountData[]
  developmentAccountsMeta: DevelopmentAccountListResponseMeta
}

export interface DevelopmentAccountListResponseMeta extends ListMeta {
  sort: DevelopmentAccountSorting
}

export class DevelopmentAccounts extends ModelList<DevelopmentAccount, DevelopmentAccountData, DevelopmentAccountListResponseMeta> {
  constructor (developmentAccounts: DevelopmentAccountData[], developmentAccountsMeta: DevelopmentAccountListResponseMeta, sessionHandler: SessionHandler) {
    super(DevelopmentAccount, developmentAccounts, developmentAccountsMeta, sessionHandler)
  }
}

export class DevelopmentAccount extends Model {
  protected _developmentAccountData: DevelopmentAccountData

  constructor (developmentAccountData: DevelopmentAccountData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._developmentAccountData = developmentAccountData
  }

  protected setDevelopmentAccount (developmentAccountData: DevelopmentAccountData) {
    this._developmentAccountData = developmentAccountData
  }

  get id () {
    return this._developmentAccountData.id
  }

  get company () {
    return this._developmentAccountData.company
  }

  get address () {
    return this._developmentAccountData.address
  }

  get websiteUrl () {
    return this._developmentAccountData.websiteUrl
  }

  async reload () {
    const { developmentAccount } = await this.action('developmentAccount:show', { id: this.id }) as DevelopmentAccountResponse
    this.setDevelopmentAccount(developmentAccount)
    return this
  }

  async createApplication (params: { applicationName: string, redirectUrl: string }) {
    const { application } = (await this.action('application:create', { ...params, developmentAccountId: this.id })) as ApplicationResponse
    return new Application(application, this.sessionHandler)
  }

  async getApplication (params: { id: number }) {
    const { application } = (await this.action('application:show', { ...params, developmentAccountId: this.id })) as ApplicationResponse
    return new Application(application, this.sessionHandler)
  }

  async getApplications (options: { sort?: ApplicationSorting, ascending?: boolean, limit?: number, offset?: number }) {
    const { applications, applicationsMeta } = (await this.action('application:list', { ...options, developmentAccountId: this.id })) as ApplicationListResponse
    return new Applications(applications, applicationsMeta, this.sessionHandler)
  }

  async initializeDevelopmentAccountRelationshipRequest (params: { email: string, role: DevelopmentAccountRelationshipRole }) {
    const { developmentAccountRelationshipRequest } = (await this.action('developmentAccountRelationshipRequest:init', { ...params, developmentAccountId: this.id })) as DevelopmentAccountRelationshipRequestResponse
    return new DevelopmentAccountRelationshipRequest(developmentAccountRelationshipRequest, this.sessionHandler)
  }

  async getDevelopmentAccountRelationshipRequest (params: { id: number }) {
    const { developmentAccountRelationshipRequest } = await this.action('developmentAccountRelationshipRequest:show', { ...params, developmentAccountId: this.id }) as DevelopmentAccountRelationshipRequestResponse
    return new DevelopmentAccountRelationshipRequest(developmentAccountRelationshipRequest, this.sessionHandler)
  }

  async getDevelopmentAccountRelationshipRequests (options: { email?: string, sort?: DevelopmentAccountRelationshipRequestSorting, ascending?: boolean, limit?: number, offset?: number}) {
    const { developmentAccountRelationshipRequests, developmentAccountRelationshipRequestsMeta } = await this.action('developmentAccountRelationshipRequest:list', { ...options, developmentAccountId: this.id }) as DevelopmentAccountRelationshipRequestListResponse
    return new DevelopmentAccountRelationshipRequests(developmentAccountRelationshipRequests, developmentAccountRelationshipRequestsMeta, this.sessionHandler)
  }

  async getDevelopmentAccountRelationship (params: { id: number }) {
    const { developmentAccountRelationship } = await this.action('developmentAccountRelationship:show', { ...params, developmentAccountId: this.id }) as DevelopmentAccountRelationshipResponse
    return new DevelopmentAccountRelationship(developmentAccountRelationship, this.sessionHandler)
  }

  async getDevelopmentAccountRelationships (options?: { sort?: DevelopmentAccountRelationshipSorting, ascending?: boolean, limit?: number, offset?: number}) {
    const { developmentAccountRelationships, developmentAccountRelationshipsMeta } = await this.action('developmentAccountRelationship:list', { ...options, developmentAccountId: this.id }) as DevelopmentAccountRelationshipListResponse
    return new DevelopmentAccountRelationships(developmentAccountRelationships, developmentAccountRelationshipsMeta, this.sessionHandler)
  }

  async update (options: { company: string, address: string, websiteUrl: string }) {
    const { developmentAccount } = (await this.action('developmentAccount:update', { ...options, id: this.id })) as DevelopmentAccountResponse
    this.setDevelopmentAccount(developmentAccount)
    return this
  }

  async delete () {
    await this.action('developmentAccount:delete', { id: this.id })
  }
}
