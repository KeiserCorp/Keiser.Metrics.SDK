import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

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

export class UserApplicationAuthorization extends Model {
  protected _userApplicationAuthorizationData: UserApplicationAuthorizationData

  constructor (userApplicationAuthorizationData: UserApplicationAuthorizationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userApplicationAuthorizationData = userApplicationAuthorizationData
  }

  protected setUserApplicationAuthorization (userApplicationAuthorizationData: UserApplicationAuthorizationData) {
    this._userApplicationAuthorizationData = userApplicationAuthorizationData
  }

  async reload () {
    const { userApplicationAuthorization } = await this.action('userApplicationAuthorization:show', { id: this.id }) as UserApplicationAuthorizationResponse
    this.setUserApplicationAuthorization(userApplicationAuthorization)
    return this
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

  async userDelete () {
    await this.action('userApplicationAuthorization:userDelete', { id: this.id, userId: this.userId })
  }

  async developerDelete (params: { developmentAccountId: number }) {
    await this.action('userApplicationAuthorization:developerDelete', { ...params, id: this.id })
  }
}
