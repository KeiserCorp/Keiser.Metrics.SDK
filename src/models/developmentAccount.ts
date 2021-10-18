import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

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
  company?: string
  address?: string
  websiteUrl?: string
  sort: DevelopmentAccountSorting
}

export class DevelopmentAccounts extends ModelList<DevelopmentAccount, DevelopmentAccountData, DevelopmentAccountListResponseMeta> {
  constructor (developmentAccounts: DevelopmentAccountData[], developmentAccountMeta: DevelopmentAccountListResponseMeta, sessionHandler: SessionHandler) {
    super(DevelopmentAccount, developmentAccounts, developmentAccountMeta, sessionHandler)
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

  async createDevelopmentAccount (options: { company?: string, address?: string, websiteUrl?: string }) {
    const { developmentAccount } = (await this.action('developmentAccount:create', { ...options })) as DevelopmentAccountResponse
    this.setDevelopmentAccount(developmentAccount)
    return this
  }

  async update (options: { id: number, company?: string, address?: string, websiteUrl?: string }) {
    const { developmentAccount } = (await this.action('developmentAccount:update', { ...options })) as DevelopmentAccountResponse
    this.setDevelopmentAccount(developmentAccount)
    return this
  }

  async delete () {
    await this.action('developmentAccount:delete', { id: this.id })
  }
}
