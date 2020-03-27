import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { EmailAddressData, EmailAddress, EmailAddressResponse } from './emailAddress'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { OAuthServiceData } from './oauthService'
import { ProfileData, Profile } from './profile'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'

export interface UserData {
  id: number
  emailAddresses: EmailAddressData[]
  primaryEmailAddress: PrimaryEmailAddressResponse
  basicCredential: boolean
  oauthServices: OAuthServiceData[]
  profile: ProfileData,
  acceptedTermsVersion: AcceptedTermsVersionData
}

export interface UserResponse extends AuthenticatedResponse {
  user: UserData
}

export interface UserListResponse extends AuthenticatedResponse {
  users: UserData[]
}

export class User extends Model {
  private _userData: UserData
  private _isSessionUser: boolean

  constructor (userData: UserData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userData = userData
    this._isSessionUser = this._userData.id === this.sessionHandler.decodedAccessToken.user.id
  }

  private setUserData (userData: UserData) {
    Object.assign(this._userData, userData)
  }

  async reload () {
    const { user } = await this.action('user:show', { userId : this.id }) as UserResponse
    this.setUserData(user)
    return this
  }

  async addBasicLogin (email: string, password: string) {
    if (!this._isSessionUser) {
      throw new Error('Cannot set basic login for other users')
    }

    const { user } = await this.action('auth:connect', { email, password }) as UserResponse
    this.setUserData(user)
  }

  async changePassword (password: string) {
    if (!this._isSessionUser) {
      throw new Error('Cannot change password for other users')
    }

    const { user } = await this.action('auth:update', { password }) as UserResponse
    this.setUserData(user)
  }

  async delete () {
    await this.action('user:delete', { userId: this.id })
  }

  get id () {
    return this._userData.id
  }

  get emailAddresses () {
    return this._userData.emailAddresses.map(e => new EmailAddress(e, this.id, this.sessionHandler))
  }

  async createEmailAddress (email: string) {
    const { emailAddress } = await this.action('emailAddress:create', { userId : this.id, email }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.id, this.sessionHandler)
  }

  get basicCredential () {
    return this._userData.basicCredential
  }

  get profile () {
    return new Profile(this._userData.profile, this.id, this.sessionHandler)
  }

  get acceptedTermsVersion () {
    return this._userData.acceptedTermsVersion ? new AcceptedTermsVersion(this._userData.acceptedTermsVersion, this.id, this.sessionHandler) : undefined
  }

  async createAcceptedTermsVersion (revision: string) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { userId : this.id, revision }) as AcceptedTermsVersionResponse
    return new AcceptedTermsVersion(acceptedTermsVersion, this.id, this.sessionHandler)
  }
}
