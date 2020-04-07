import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { EmailAddressData, EmailAddress, EmailAddressResponse, EmailAddressListResponse } from './emailAddress'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { OAuthServiceData } from './oauthService'
import { ProfileData, Profile } from './profile'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'
import { WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponse, WeightMeasurementResponse } from './weightMeasurement'
import { HeightMeasurementData, HeightMeasurement, HeightMeasurementResponse, HeightMeasurementListResponse } from './heightMeasurement'

export interface UserData {
  id: number
  emailAddresses: EmailAddressData[]
  primaryEmailAddress: PrimaryEmailAddressResponse
  basicCredential: boolean
  oauthServices: OAuthServiceData[]
  profile: ProfileData,
  acceptedTermsVersion?: AcceptedTermsVersionData
  weightMeasurement?: WeightMeasurementData
  heightMeasurement?: HeightMeasurementData
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
    return this._userData.emailAddresses.map(emailAddress => new EmailAddress(emailAddress, this.id, this.sessionHandler))
  }

  async createEmailAddress (params: {email: string}) {
    const { emailAddress } = await this.action('emailAddress:create', { userId : this.id, ...params }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.id, this.sessionHandler)
  }

  async getEmailAddresses () {
    const { emailAddresses } = await this.action('emailAddress:list', { userId : this.id }) as EmailAddressListResponse
    return emailAddresses.map(emailAddress => new EmailAddress(emailAddress, this.id, this.sessionHandler))
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

  async createAcceptedTermsVersion (params: {revision: string}) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { userId : this.id, ...params }) as AcceptedTermsVersionResponse
    return new AcceptedTermsVersion(acceptedTermsVersion, this.id, this.sessionHandler)
  }

  get latestWeightMeasurement () {
    return this._userData.weightMeasurement ? new WeightMeasurement(this._userData.weightMeasurement, this.id,this.sessionHandler) : undefined
  }

  async createWeightMeasurement (params: {source: string, takenAt: Date, metricWeight?: number, imperialWeight?: number, bodyFatPercentage?: number}) {
    const { weightMeasurement } = await this.action('weightMeasurement:create', { userId : this.id, ...params }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.id, this.sessionHandler)
  }

  async getWeightMeasurements (options: {from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { weightMeasurements } = await this.action('weightMeasurement:list', { userId : this.id, ...options }) as WeightMeasurementListResponse
    return weightMeasurements.map(weightMeasurement => new WeightMeasurement(weightMeasurement, this.id, this.sessionHandler))
  }

  get latestHeightMeasurement () {
    return this._userData.heightMeasurement ? new HeightMeasurement(this._userData.heightMeasurement, this.id,this.sessionHandler) : undefined
  }

  async createHeightMeasurement (params: {source: string, takenAt: Date, metricHeight?: number, imperialHeight?: number, bodyFatPercentage?: number}) {
    const { heightMeasurement } = await this.action('heightMeasurement:create', { userId : this.id, ...params }) as HeightMeasurementResponse
    return new HeightMeasurement(heightMeasurement, this.id, this.sessionHandler)
  }

  async getHeightMeasurements (options: {from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { heightMeasurements } = await this.action('heightMeasurement:list', { userId : this.id, ...options }) as HeightMeasurementListResponse
    return heightMeasurements.map(heightMeasurement => new HeightMeasurement(heightMeasurement, this.id, this.sessionHandler))
  }
}
