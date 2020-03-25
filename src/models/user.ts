import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { EmailAddressResponse } from './emailAddress'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { OAuthServiceResponse } from './oauthService'
import { ProfileResponse } from './profile'

export interface UserData {
  id: number
  emailAddress: EmailAddressResponse[]
  primaryEmailAddress: PrimaryEmailAddressResponse
  basicCredential: boolean
  oauthServices: OAuthServiceResponse[]
  profile: ProfileResponse
}

export interface UserResponse extends AuthenticatedResponse {
  user: UserData
}

export class User extends Model {
  private _userData: UserData

  constructor (userData: UserData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userData = userData
    this.setUserResponse(userData)
  }

  private setUserResponse (userData: UserData) {
    this._userData = userData
  }

  get id () {
    return this._userData.id
  }

  async reload () {
    const { user } = await this.action('user:show') as UserResponse
    this.setUserResponse(user)
  }
}
