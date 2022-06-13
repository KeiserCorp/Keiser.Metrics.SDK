import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Application, ApplicationResponse } from './application'
import { User, UserResponse } from './user'

export enum UserApplicationAuthorizationSorting {
  ID = 'id',
  UserId = 'userId'
}

export interface UserApplicationAuthorizationData {
  id: number
  userId: number
  applicationId: number
}

export interface UserApplicationAuthorizationResponse extends AuthenticatedResponse {
  userApplicationAuthorization: UserApplicationAuthorizationData
}

export interface UserApplicationAuthorizationListResponse extends AuthenticatedResponse {
  userApplicationAuthorizations: UserApplicationAuthorizationData[]
  userApplicationAuthorizationsMeta: UserApplicationAuthorizationListResponseMeta
}

export interface UserApplicationAuthorizationListResponseMeta extends ListMeta {
  sort: UserApplicationAuthorizationSorting
}

export class UserApplicationAuthorizations extends ModelList<UserApplicationAuthorization, UserApplicationAuthorizationData, UserApplicationAuthorizationListResponseMeta> {
  constructor (userApplicationAuthorizations: UserApplicationAuthorizationData[], userApplicationAuthorizationsMeta: UserApplicationAuthorizationListResponseMeta, sessionHandler: SessionHandler) {
    super(UserApplicationAuthorization, userApplicationAuthorizations, userApplicationAuthorizationsMeta, sessionHandler)
  }
}
export class DeveloperUserApplicationAuthorizations extends ModelList<DeveloperUserApplicationAuthorization, UserApplicationAuthorizationData, UserApplicationAuthorizationListResponseMeta> {
  constructor (userApplicationAuthorizations: UserApplicationAuthorizationData[], userApplicationAuthorizationsMeta: UserApplicationAuthorizationListResponseMeta, sessionHandler: SessionHandler) {
    super(DeveloperUserApplicationAuthorization, userApplicationAuthorizations, userApplicationAuthorizationsMeta, sessionHandler)
  }
}

export class UserApplicationAuthorizationBase extends Model {
  protected _userApplicationAuthorizationData: UserApplicationAuthorizationData

  constructor (userApplicationAuthorizationData: UserApplicationAuthorizationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userApplicationAuthorizationData = userApplicationAuthorizationData
  }

  protected setUserApplicationAuthorization (userApplicationAuthorizationData: UserApplicationAuthorizationData) {
    this._userApplicationAuthorizationData = userApplicationAuthorizationData
  }

  ejectData () {
    return this.eject(this._userApplicationAuthorizationData)
  }

  get id () {
    return this._userApplicationAuthorizationData.id
  }

  get userId () {
    return this._userApplicationAuthorizationData.userId
  }

  get applicationId () {
    return this._userApplicationAuthorizationData.applicationId
  }

  async getApplication (developmentAccountId: number) {
    const { application } = await this.action('application:show', { id: this.applicationId, developmentAccountId: developmentAccountId }) as ApplicationResponse
    return new Application(application, this.sessionHandler)
  }
}

export class UserApplicationAuthorization extends UserApplicationAuthorizationBase {
  async reload () {
    const { userApplicationAuthorization } = await this.action('userApplicationAuthorization:userShow', { id: this.id, userId: this.userId }) as UserApplicationAuthorizationResponse
    this.setUserApplicationAuthorization(userApplicationAuthorization)
    return this
  }

  async delete () {
    await this.action('userApplicationAuthorization:userDelete', { id: this.id, userId: this.userId })
  }
}

export class DeveloperUserApplicationAuthorization extends UserApplicationAuthorizationBase {
  async reload (params: { developmentAccountId: number }) {
    const { userApplicationAuthorization } = await this.action('userApplicationAuthorization:developerShow', { ...params, id: this.id }) as UserApplicationAuthorizationResponse
    this.setUserApplicationAuthorization(userApplicationAuthorization)
    return this
  }

  async getUser () {
    const { user } = await this.action('user:show', { userId: this.userId }) as UserResponse
    return new User(user, this.sessionHandler)
  }

  async delete (params: { developmentAccountId: number }) {
    await this.action('userApplicationAuthorization:developerDelete', { ...params, id: this.id })
  }
}
