import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { EmailAddressData, EmailAddress, EmailAddressResponse, EmailAddressListResponse } from './emailAddress'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { OAuthServiceData, OAuthService, OAuthServiceListResponse } from './oauthService'
import { ProfileData, Profile } from './profile'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'
import { WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponse, WeightMeasurementResponse } from './weightMeasurement'
import { HeightMeasurementData, HeightMeasurement, HeightMeasurementResponse, HeightMeasurementListResponse } from './heightMeasurement'
import { FacilityRelationshipData, FacilityRelationshipListResponse } from './facilityRelationship'
import { UserFacilityRelationship } from './userFacilityRelationship'
import { OAuthProviders } from '../constants'

export interface UserData {
  id: number
  emailAddresses: EmailAddressData[]
  primaryEmailAddress: PrimaryEmailAddressResponse
  basicCredential?: boolean
  oauthServices?: OAuthServiceData[]
  profile: ProfileData,
  acceptedTermsVersion?: AcceptedTermsVersionData
  weightMeasurement?: WeightMeasurementData
  heightMeasurement?: HeightMeasurementData
  facilityRelationships?: FacilityRelationshipData[]
}

export interface UserResponse extends AuthenticatedResponse {
  user: UserData
}

export interface UserListResponse extends AuthenticatedResponse {
  users: UserData[]
}

export interface OAuthConnectResponse extends AuthenticatedResponse {
  url: string
}

export class User extends Model {
  private _userData: UserData
  private _isSessionUser: boolean

  constructor (userData: UserData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userData = userData
    this._isSessionUser = this.id === this.sessionHandler.decodedAccessToken.user.id
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
    const { emailAddress } = await this.action('emailAddress:create', { ...params, userId : this.id }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.id, this.sessionHandler)
  }

  async getEmailAddresses () {
    const { emailAddresses } = await this.action('emailAddress:list', { userId : this.id }) as EmailAddressListResponse
    return emailAddresses.map(emailAddress => new EmailAddress(emailAddress, this.id, this.sessionHandler))
  }

  get basicCredential () {
    return this._userData.basicCredential
  }

  get oauthServices () {
    return (this._userData.oauthServices || []).map(oauthService => new OAuthService(oauthService, this.id, this.sessionHandler))
  }

  async getOAuthServices (options: { limit?: number, offset?: number } = { }) {
    const { oauthServices } = await this.action('oauthService:list', { ...options, userId : this.id }) as OAuthServiceListResponse
    return oauthServices.map(oauthService => new OAuthService(oauthService, this.id, this.sessionHandler))
  }

  async createOAuthService (options: {service: OAuthProviders, redirect: string}) {
    const response = await this.action('oauth:initiate', { ...options, type: 'connect' }) as OAuthConnectResponse
    return response.url
  }

  get profile () {
    return new Profile(this._userData.profile, this.id, this.sessionHandler)
  }

  get acceptedTermsVersion () {
    return this._userData.acceptedTermsVersion ? new AcceptedTermsVersion(this._userData.acceptedTermsVersion, this.id, this.sessionHandler) : undefined
  }

  async createAcceptedTermsVersion (params: {revision: string}) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { ...params, userId : this.id }) as AcceptedTermsVersionResponse
    return new AcceptedTermsVersion(acceptedTermsVersion, this.id, this.sessionHandler)
  }

  get latestWeightMeasurement () {
    return this._userData.weightMeasurement ? new WeightMeasurement(this._userData.weightMeasurement, this.id,this.sessionHandler) : undefined
  }

  async createWeightMeasurement (params: {source: string, takenAt: Date, metricWeight?: number, imperialWeight?: number, bodyFatPercentage?: number}) {
    const { weightMeasurement } = await this.action('weightMeasurement:create', { ...params, userId : this.id }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.id, this.sessionHandler)
  }

  async getWeightMeasurements (options: {from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { weightMeasurements } = await this.action('weightMeasurement:list', { ...options, userId : this.id }) as WeightMeasurementListResponse
    return weightMeasurements.map(weightMeasurement => new WeightMeasurement(weightMeasurement, this.id, this.sessionHandler))
  }

  get latestHeightMeasurement () {
    return this._userData.heightMeasurement ? new HeightMeasurement(this._userData.heightMeasurement, this.id,this.sessionHandler) : undefined
  }

  async createHeightMeasurement (params: {source: string, takenAt: Date, metricHeight?: number, imperialHeight?: number, bodyFatPercentage?: number}) {
    const { heightMeasurement } = await this.action('heightMeasurement:create', { ...params, userId : this.id }) as HeightMeasurementResponse
    return new HeightMeasurement(heightMeasurement, this.id, this.sessionHandler)
  }

  async getHeightMeasurements (options: {from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { heightMeasurements } = await this.action('heightMeasurement:list', { ...options, userId : this.id }) as HeightMeasurementListResponse
    return heightMeasurements.map(heightMeasurement => new HeightMeasurement(heightMeasurement, this.id, this.sessionHandler))
  }

  async getFacilityMembershipRelationships () {
    const { facilityRelationships } = await this.action('facilityRelationship:userList', { userId : this.id, member: true }) as FacilityRelationshipListResponse
    return facilityRelationships.map(facilityRelationship => new UserFacilityRelationship(facilityRelationship, this.sessionHandler))
  }

  async getFacilityEmploymentRelationships (options: { employeeRole?: string } = {}) {
    const { facilityRelationships } = await this.action('facilityRelationship:userList', { ...options, employee: true, userId : this.id }) as FacilityRelationshipListResponse
    return facilityRelationships.map(facilityRelationship => new UserFacilityRelationship(facilityRelationship, this.sessionHandler))
  }
}

export class Users extends Model {
  async getUsers (params: {name?: string, limit?: number, offset?: number} = { limit: 20 }) {
    const { users } = await this.action('user:list', params) as UserListResponse
    return users.map(user => new User(user, this.sessionHandler))
  }

  async mergeUsers (params: {fromUserId: number, toUserId: number}) {
    const { user } = await this.action('user:merge', params) as UserResponse
    return new User(user, this.sessionHandler)
  }
}
