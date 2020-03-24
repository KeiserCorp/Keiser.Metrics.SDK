import { SessionHandler } from '../session'
import { Model } from '../model'
import { EmailAddressResponse } from './emailAddress'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { OAuthServiceResponse } from './oauthService'
import { ProfileResponse } from './profile'

export interface UserResponse {
  id: number
  emailAddress: EmailAddressResponse[]
  primaryEmailAddress: PrimaryEmailAddressResponse
  basicCredential: boolean
  oauthServices: OAuthServiceResponse[]
  profile: ProfileResponse
}

export class User extends Model {
  private _userResponse: UserResponse

  constructor (userResponse: UserResponse, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userResponse = userResponse
    this.setUserResponse(userResponse)
  }

  private setUserResponse (userResponse: UserResponse) {
    this._userResponse = userResponse
  }

  get id () {
    return this._userResponse.id
  }

  async reload () {
    const { user } = await this.action('user:show') as { user: UserResponse }
    this.setUserResponse(user)
  }
}
