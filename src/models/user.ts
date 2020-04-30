import { ClientSideActionPrevented } from '../error'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'
import { EmailAddress, EmailAddressData, EmailAddressListResponse, EmailAddressResponse } from './emailAddress'
import { Facility, FacilityListResponse } from './facility'
import { FacilityRelationshipData, FacilityRelationshipListResponse, UserFacilityRelationship } from './facilityRelationship'
import { HeartRateCapturedDataPoint, HeartRateDataSet, HeartRateDataSetListResponse, HeartRateDataSetResponse } from './heartRateDataSet'
import { HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponse, HeightMeasurementResponse } from './heightMeasurement'
import { MSeriesCapturedDataPoint, MSeriesDataSet, MSeriesDataSetListResponse, MSeriesDataSetResponse } from './mSeriesDataSet'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementListResponse, MSeriesFtpMeasurementResponse } from './mSeriesFtpMeasurement'
import { OAuthService, OAuthServiceData, OAuthServiceListResponse } from './oauthService'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { Profile, ProfileData } from './profile'
import { Session, SessionListResponse, SessionResponse } from './session'
import { ForceUnit, ResistancePrecision, StrengthMachineDataSet, StrengthMachineDataSetListResponse, StrengthMachineDataSetResponse } from './strengthMachineDataSet'
import { WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponse, WeightMeasurementResponse } from './weightMeasurement'

export enum OAuthProviders {
  Google = 'google',
  Facebook = 'facebook',
  Strava = 'strava',
  TrainingPeaks = 'trainingpeaks'
}

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

/** @hidden */
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
    this._userData = userData
  }

  async reload () {
    const { user } = await this.action('user:show', { userId : this.id }) as UserResponse
    this.setUserData(user)
    return this
  }

  async addBasicLogin (email: string, password: string) {
    if (!this._isSessionUser) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot set basic login for other users' })
    }

    const { user } = await this.action('auth:connect', { email, password }) as UserResponse
    this.setUserData(user)
  }

  async changePassword (password: string) {
    if (!this._isSessionUser) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot change password for other users' })
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
    return this._userData.basicCredential === true
  }

  get oauthServices () {
    return (this._userData.oauthServices || []).map(oauthService => new OAuthService(oauthService, this.id, this.sessionHandler))
  }

  async createOAuthService (params: {service: OAuthProviders, redirect: string}) {
    const response = await this.action('oauth:initiate', { ...params, type: 'connect' }) as OAuthConnectResponse
    return response.url
  }

  async getOAuthServices (options: { limit?: number, offset?: number } = { }) {
    const { oauthServices } = await this.action('oauthService:list', { ...options, userId : this.id }) as OAuthServiceListResponse
    return oauthServices.map(oauthService => new OAuthService(oauthService, this.id, this.sessionHandler))
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

  async getFacilities (options: {name?: string, phone?: string, address?: string, city?: string, postcode?: string, state?: string, country?: string, limit?: number, offset?: number} = { limit: 20 }) {
    const { facilities } = await this.action('facility:list', options) as FacilityListResponse
    return facilities.map(facility => new Facility(facility, this.sessionHandler))
  }

  async getFacilityMembershipRelationships () {
    const { facilityRelationships } = await this.action('facilityRelationship:userList', { userId : this.id, member: true }) as FacilityRelationshipListResponse
    return facilityRelationships.map(facilityRelationship => new UserFacilityRelationship(facilityRelationship, this.sessionHandler))
  }

  async getFacilityEmploymentRelationships (options: { employeeRole?: string } = {}) {
    const { facilityRelationships } = await this.action('facilityRelationship:userList', { ...options, employee: true, userId : this.id }) as FacilityRelationshipListResponse
    return facilityRelationships.map(facilityRelationship => new UserFacilityRelationship(facilityRelationship, this.sessionHandler))
  }

  async startSession (params: {forceEndPrevious?: boolean, sessionPlanSequenceAssignmentId?: number} = {}) {
    const { session } = await this.action('session:start', { ...params, userId : this.id }) as SessionResponse
    return new Session(session, this.id, this.sessionHandler)
  }

  async getSessions (options: {open?: boolean, from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { sessions } = await this.action('session:list', { ...options, userId : this.id }) as SessionListResponse
    return sessions.map(session => new Session(session, this.id, this.sessionHandler))
  }

  async createMSeriesDataSet (params: {sessionId?: number, autoAttachSession?: boolean, source: string, machineType: string, ordinalId: number, buildMajor: number, buildMinor: number, mSeriesDataPoints: MSeriesCapturedDataPoint[]}) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:create', { ...params, mSeriesDataPoints: JSON.stringify(params.mSeriesDataPoints), userId : this.id }) as MSeriesDataSetResponse
    return new MSeriesDataSet(mSeriesDataSet, this.id, this.sessionHandler)
  }

  async getMSeriesDataSets (options: {source?: string, from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { mSeriesDataSets } = await this.action('mSeriesDataSet:list', { ...options, userId : this.id }) as MSeriesDataSetListResponse
    return mSeriesDataSets.map(mSeriesDataSet => new MSeriesDataSet(mSeriesDataSet, this.id, this.sessionHandler))
  }

  async createMSeriesFtpMeasurement (params: {source: string, takenAt: Date, machineType: string, ftp: number}) {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:create', { ...params, userId : this.id }) as MSeriesFtpMeasurementResponse
    return new MSeriesFtpMeasurement(mSeriesFtpMeasurement, this.id, this.sessionHandler)
  }

  async getMSeriesFtpMeasurements (options: {machineType?: string, from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { mSeriesFtpMeasurements } = await this.action('mSeriesFtpMeasurement:list', { ...options, userId : this.id }) as MSeriesFtpMeasurementListResponse
    return mSeriesFtpMeasurements.map(mSeriesFtpMeasurement => new MSeriesFtpMeasurement(mSeriesFtpMeasurement, this.id, this.sessionHandler))
  }

  async createHeartRateDataSet (params: {sessionId?: number, autoAttachSession?: boolean, source: string, heartRateDataPoints: HeartRateCapturedDataPoint[]}) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:create', { ...params, heartRateDataPoints: JSON.stringify(params.heartRateDataPoints), userId : this.id }) as HeartRateDataSetResponse
    return new HeartRateDataSet(heartRateDataSet, this.id, this.sessionHandler)
  }

  async getHeartRateDataSets (options: {source?: string, from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { heartRateDataSets } = await this.action('heartRateDataSet:list', { ...options, userId : this.id }) as HeartRateDataSetListResponse
    return heartRateDataSets.map(heartRateDataSet => new HeartRateDataSet(heartRateDataSet, this.id, this.sessionHandler))
  }

  async createStrengthMachineDataSet (params: {sessionId?: number, autoAttachSession?: boolean, strengthMachineId: number, exerciseId?: number, facilityId?: number, version: string, serial: string, completedAt: Date, chest?: number, rom1?: number, rom2?: number, seat?: number, resistance: number, resistancePrecision: ResistancePrecision, repetitionCount: number, forceUnit: ForceUnit, peakPower: number, work: number, distance?: number, addedWeight?: number}) {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:create', { ...params, userId : this.id }) as StrengthMachineDataSetResponse
    return new StrengthMachineDataSet(strengthMachineDataSet, this.id, this.sessionHandler)
  }

  async getStrengthMachineDataSets (options: {from?: Date, to?: Date, limit?: number, offset?: number} = { limit: 20 }) {
    const { strengthMachineDataSets } = await this.action('strengthMachineDataSet:list', { ...options, userId : this.id }) as StrengthMachineDataSetListResponse
    return strengthMachineDataSets.map(strengthMachineDataSet => new StrengthMachineDataSet(strengthMachineDataSet, this.id, this.sessionHandler))
  }
}

/** @hidden */
export class Users extends Model {
  async getUsers (options: {name?: string, limit?: number, offset?: number} = { limit: 20 }) {
    const { users } = await this.action('user:list', options) as UserListResponse
    return users.map(user => new User(user, this.sessionHandler))
  }

  async mergeUsers (params: {fromUserId: number, toUserId: number}) {
    const { user } = await this.action('user:merge', params) as UserResponse
    return new User(user, this.sessionHandler)
  }
}
