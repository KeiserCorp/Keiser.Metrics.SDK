import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { UserApplicationAuthorization, UserApplicationAuthorizationListResponse, UserApplicationAuthorizationResponse, UserApplicationAuthorizations, UserApplicationAuthorizationSorting } from './userApplicationAuthorization'

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
  clientSecret?: string
}

export interface ApplicationResponse extends AuthenticatedResponse {
  application: ApplicationData
}

export interface ApplicationListResponse extends AuthenticatedResponse {
  applications: ApplicationData[]
  applicationsMeta: ApplicationListResponseMeta
}

export interface ApplicationListResponseMeta extends ListMeta {
  developmentAccountId: number
  name: string
  sort: ApplicationSorting
}

export class Applications extends ModelList<Application, ApplicationData, ApplicationListResponseMeta> {
  constructor (applications: ApplicationData[], applicationsMeta: ApplicationListResponseMeta, sessionHandler: SessionHandler) {
    super(Application, applications, applicationsMeta, sessionHandler)
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

  ejectData () {
    return this.eject(this._applicationData)
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

  get clientSecret () {
    return this._applicationData.clientSecret
  }

  async reload () {
    const { application } = await this.action('application:show', { id: this.id, developmentAccountId: this.developmentAccountId }) as ApplicationResponse
    this.setApplication(application)
    return this
  }

  async getUserApplicationAuthorization (params: { id: number, developmentAccountId: number }) {
    const { userApplicationAuthorization } = await this.action('userApplicationAuthorization:developerShow', { ...params }) as UserApplicationAuthorizationResponse
    return new UserApplicationAuthorization(userApplicationAuthorization, this.sessionHandler)
  }

  async getUserApplicationAuthorizations (options: { developmentAccountId: number, applicationId: number, sort?: UserApplicationAuthorizationSorting, ascending?: boolean, limit?: number, offset?: number }) {
    const { userApplicationAuthorizations, userApplicationAuthorizationsMeta } = await this.action('userApplicationAuthorization:developerList', { ...options }) as UserApplicationAuthorizationListResponse
    return new UserApplicationAuthorizations(userApplicationAuthorizations, userApplicationAuthorizationsMeta, this.sessionHandler)
  }

  async update (options: { applicationName?: string, redirectUrl?: string }) {
    const { application } = (await this.action('application:update', { ...options, id: this.id, developmentAccountId: this.developmentAccountId })) as ApplicationResponse
    this.setApplication(application)
    return this
  }

  async delete () {
    await this.action('application:delete', { id: this.id, developmentAccountId: this.developmentAccountId })
  }
}
