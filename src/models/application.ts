import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum ApplicationSorting {
  ID = 'id',
  ApplicationName = 'applicationName',
}

export interface ApplicationData {
  id: number
  developmentAccountId: number
  applicationName: string
  redirectUrl: string
  clientId: string
  clientSecret: string
}

export interface ApplicationResponse extends AuthenticatedResponse {
  application: ApplicationData
}

export interface ApplicationListResponse extends AuthenticatedResponse {
  applications: ApplicationData[]
  applicationsMeta: ApplicationListResponseMeta
}

export interface ApplicationListResponseMeta extends ListMeta {
  redirectUrl?: string
  clientId?: string
  sort: ApplicationSorting
}

export class Applications extends ModelList<Application, ApplicationData, ApplicationListResponseMeta> {
  constructor (applications: ApplicationData[], applicationMeta: ApplicationListResponseMeta, sessionHandler: SessionHandler) {
    super(Application, applications, applicationMeta, sessionHandler)
  }
}

export class Application extends Model {
  protected _applicationData: ApplicationData

  constructor (applicationData: ApplicationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._applicationData = applicationData
  }

  protected setApplication (applicationData: ApplicationData) {
    this._applicationData = applicationData
  }

  get id () {
    return this._applicationData.id
  }

  get developmentAccountId () {
    return this._applicationData.developmentAccountId
  }

  get applicationName () {
    return this._applicationData.applicationName
  }

  get redirectUrl () {
    return this._applicationData.redirectUrl
  }

  get clientId () {
    return this._applicationData.clientId
  }

  async createApplication (params: { developmentAccountId: number, applicationName: string, redirectUrl: string }) {
    const { application } = (await this.action('application:create', { ...params })) as ApplicationResponse
    this.setApplication(application)
    return this
  }

  async getApplication (params: { id: number, developmentAccountId: number }) {
    const { application } = (await this.action('application:show', { ...params })) as ApplicationResponse
    return application
  }

  async getApplications (options: { developmentAccountId: number, sort?: ApplicationSorting, ascending?: boolean, limit?: number, offset?: number }) {
    const { applications } = (await this.action('application:list', { ...options })) as ApplicationListResponse
    return applications
  }

  async update (options: { id: number, developmentAccountId: number, applicationName?: string, redirectUrl?: string }) {
    const { application } = (await this.action('application:update', { ...options })) as ApplicationResponse
    this.setApplication(application)
    return this
  }

  async delete () {
    await this.action('application:delete', { id: this.id, developmentAccountId: this.developmentAccountId })
  }
}
