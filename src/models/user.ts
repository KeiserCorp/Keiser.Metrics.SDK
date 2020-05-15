import { ClientSideActionPrevented } from '../error'
import { BaseModelList, ListMeta, Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'
import { EmailAddress, EmailAddressData, EmailAddresses, EmailAddressListResponse, EmailAddressResponse, EmailAddressSorting } from './emailAddress'
import { ExerciseListResponse, Exercises, ExerciseSorting, ExerciseType } from './exercise'
import { Facilities, FacilityListResponse, FacilitySorting } from './facility'
import { FacilityRelationshipData, UserFacilityRelationshipListResponse, UserFacilityRelationships, UserFacilityRelationshipSorting } from './facilityRelationship'
import { HeartRateCapturedDataPoint, HeartRateDataSet, HeartRateDataSetListResponse, HeartRateDataSetResponse, HeartRateDataSets, HeartRateDataSetSorting } from './heartRateDataSet'
import { HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponse, HeightMeasurementResponse, HeightMeasurements, HeightMeasurementSorting } from './heightMeasurement'
import { MSeriesCapturedDataPoint, MSeriesDataSet, MSeriesDataSetListResponse, MSeriesDataSetResponse, MSeriesDataSets, MSeriesDataSetSorting } from './mSeriesDataSet'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementListResponse, MSeriesFtpMeasurementResponse, MSeriesFtpMeasurements, MSeriesFtpMeasurementSorting } from './mSeriesFtpMeasurement'
import { OAuthService, OAuthServiceData, OAuthServiceListResponse, OAuthServices } from './oauthService'
import { PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { Profile, ProfileData } from './profile'
import { Session, SessionListResponse, SessionResponse, Sessions, SessionSorting } from './session'
import { ForceUnit, ResistancePrecision, StrengthMachineDataSet, StrengthMachineDataSetListResponse, StrengthMachineDataSetResponse, StrengthMachineDataSets, StrengthMachineDataSetSorting } from './strengthMachineDataSet'
import { WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponse, WeightMeasurementResponse, WeightMeasurements, WeightMeasurementSorting } from './weightMeasurement'

export const enum OAuthProviders {
  Google = 'google',
  Facebook = 'facebook',
  Strava = 'strava',
  TrainingPeaks = 'trainingpeaks'
}

/** @hidden */
export const enum UserSorting {
  ID = 'id',
  Name = 'name',
  CreatedAt = 'createdAt'
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
  usersMeta: UserListResponseMeta
}

/** @hidden */
export interface UserListResponseMeta extends ListMeta {
  name: string | undefined
  email: string | undefined
  sort: UserSorting
}

/** @hidden */
export class Users extends BaseModelList<User, UserData, UserListResponseMeta> {
  constructor (users: UserData[], usersMeta: UserListResponseMeta, sessionHandler: SessionHandler) {
    super(User, users, usersMeta, sessionHandler)
  }
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

  async createEmailAddress (params: {email: string}) {
    const { emailAddress } = await this.action('emailAddress:create', { ...params, userId : this.id }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.sessionHandler, this.id)
  }

  async getEmailAddresses (options: {email?: string, sort?: EmailAddressSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { emailAddresses, emailAddressesMeta } = await this.action('emailAddress:list', { ...options, userId : this.id }) as EmailAddressListResponse
    return new EmailAddresses(emailAddresses, emailAddressesMeta, this.sessionHandler, this.id)
  }

  get basicCredential () {
    return this._userData.basicCredential === true
  }

  get oauthServices () {
    return (this._userData.oauthServices || []).map(oauthService => new OAuthService(oauthService, this.sessionHandler, this.id))
  }

  async createOAuthService (params: {service: OAuthProviders, redirect: string}) {
    const response = await this.action('oauth:initiate', { ...params, type: 'connect' }) as OAuthConnectResponse
    return response.url
  }

  async getOAuthServices (options: { limit?: number, offset?: number } = { }) {
    const { oauthServices, oauthServicesMeta } = await this.action('oauthService:list', { ...options, userId : this.id }) as OAuthServiceListResponse
    return new OAuthServices(oauthServices, oauthServicesMeta, this.sessionHandler, this.id)
  }

  get profile () {
    return new Profile(this._userData.profile, this.sessionHandler, this.id)
  }

  get acceptedTermsVersion () {
    return this._userData.acceptedTermsVersion ? new AcceptedTermsVersion(this._userData.acceptedTermsVersion, this.sessionHandler, this.id) : undefined
  }

  async createAcceptedTermsVersion (params: {revision: string}) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { ...params, userId : this.id }) as AcceptedTermsVersionResponse
    return new AcceptedTermsVersion(acceptedTermsVersion, this.sessionHandler, this.id)
  }

  get latestWeightMeasurement () {
    return this._userData.weightMeasurement ? new WeightMeasurement(this._userData.weightMeasurement, this.sessionHandler, this.id) : undefined
  }

  async createWeightMeasurement (params: {source: string, takenAt: Date, metricWeight?: number, imperialWeight?: number, bodyFatPercentage?: number}) {
    const { weightMeasurement } = await this.action('weightMeasurement:create', { ...params, userId : this.id }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.sessionHandler, this.id)
  }

  async getWeightMeasurements (options: {from?: Date, to?: Date, sort?: WeightMeasurementSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { weightMeasurements, weightMeasurementsMeta } = await this.action('weightMeasurement:list', { ...options, userId : this.id }) as WeightMeasurementListResponse
    return new WeightMeasurements(weightMeasurements, weightMeasurementsMeta, this.sessionHandler, this.id)
  }

  get latestHeightMeasurement () {
    return this._userData.heightMeasurement ? new HeightMeasurement(this._userData.heightMeasurement, this.sessionHandler, this.id) : undefined
  }

  async createHeightMeasurement (params: {source: string, takenAt: Date, metricHeight?: number, imperialHeight?: number, bodyFatPercentage?: number}) {
    const { heightMeasurement } = await this.action('heightMeasurement:create', { ...params, userId : this.id }) as HeightMeasurementResponse
    return new HeightMeasurement(heightMeasurement, this.sessionHandler, this.id)
  }

  async getHeightMeasurements (options: {from?: Date, to?: Date, sort?: HeightMeasurementSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { heightMeasurements, heightMeasurementsMeta } = await this.action('heightMeasurement:list', { ...options, userId : this.id }) as HeightMeasurementListResponse
    return new HeightMeasurements(heightMeasurements, heightMeasurementsMeta, this.sessionHandler, this.id)
  }

  async getExercises (options: {name?: string, type?: ExerciseType, sort?: ExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exercises, exercisesMeta } = await this.action('exercise:list', options) as ExerciseListResponse
    return new Exercises(exercises, exercisesMeta, this.sessionHandler)
  }

  async getFacilities (options: {name?: string, phone?: string, address?: string, city?: string, postcode?: string, state?: string, country?: string, sort?: FacilitySorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { facilities ,facilitiesMeta } = await this.action('facility:list', options) as FacilityListResponse
    return new Facilities(facilities, facilitiesMeta, this.sessionHandler, this.id)
  }

  async getFacilityMembershipRelationships (options: { sort?: UserFacilityRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:userList', { userId : this.id, member: true }) as UserFacilityRelationshipListResponse
    return new UserFacilityRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler, this.id)
  }

  async getFacilityEmploymentRelationships (options: { employeeRole?: string, sort?: UserFacilityRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:userList', { ...options, employee: true, userId : this.id }) as UserFacilityRelationshipListResponse
    return new UserFacilityRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler, this.id)
  }

  async startSession (params: {forceEndPrevious?: boolean, sessionPlanSequenceAssignmentId?: number} = {}) {
    const { session } = await this.action('session:start', { ...params, userId : this.id }) as SessionResponse
    return new Session(session, this.sessionHandler, this.id)
  }

  async getSessions (options: {open?: boolean, from?: Date, to?: Date, sort?: SessionSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { sessions, sessionsMeta } = await this.action('session:list', { ...options, userId : this.id }) as SessionListResponse
    return new Sessions(sessions, sessionsMeta, this.sessionHandler, this.id)
  }

  async createMSeriesDataSet (params: {sessionId?: number, autoAttachSession?: boolean, source: string, machineType: string, ordinalId: number, buildMajor: number, buildMinor: number, mSeriesDataPoints: MSeriesCapturedDataPoint[]}) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:create', { ...params, mSeriesDataPoints: JSON.stringify(params.mSeriesDataPoints), userId : this.id }) as MSeriesDataSetResponse
    return new MSeriesDataSet(mSeriesDataSet, this.sessionHandler, this.id)
  }

  async getMSeriesDataSets (options: {source?: string, from?: Date, sort?: MSeriesDataSetSorting, ascending?: boolean, to?: Date, limit?: number, offset?: number} = { }) {
    const { mSeriesDataSets, mSeriesDataSetsMeta } = await this.action('mSeriesDataSet:list', { ...options, userId : this.id }) as MSeriesDataSetListResponse
    return new MSeriesDataSets(mSeriesDataSets, mSeriesDataSetsMeta, this.sessionHandler, this.id)
  }

  async createMSeriesFtpMeasurement (params: {source: string, takenAt: Date, machineType: string, ftp: number}) {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:create', { ...params, userId : this.id }) as MSeriesFtpMeasurementResponse
    return new MSeriesFtpMeasurement(mSeriesFtpMeasurement, this.sessionHandler, this.id)
  }

  async getMSeriesFtpMeasurements (options: {source?: string, machineType?: string, from?: Date, to?: Date, sort?: MSeriesFtpMeasurementSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta } = await this.action('mSeriesFtpMeasurement:list', { ...options, userId : this.id }) as MSeriesFtpMeasurementListResponse
    return new MSeriesFtpMeasurements(mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta, this.sessionHandler, this.id)
  }

  async createHeartRateDataSet (params: {sessionId?: number, autoAttachSession?: boolean, source: string, heartRateDataPoints: HeartRateCapturedDataPoint[]}) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:create', { ...params, heartRateDataPoints: JSON.stringify(params.heartRateDataPoints), userId : this.id }) as HeartRateDataSetResponse
    return new HeartRateDataSet(heartRateDataSet, this.sessionHandler, this.id)
  }

  async getHeartRateDataSets (options: {source?: string, from?: Date, to?: Date, sort?: HeartRateDataSetSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { heartRateDataSets, heartRateDataSetsMeta } = await this.action('heartRateDataSet:list', { ...options, userId : this.id }) as HeartRateDataSetListResponse
    return new HeartRateDataSets(heartRateDataSets, heartRateDataSetsMeta, this.sessionHandler, this.id)
  }

  async createStrengthMachineDataSet (params: {sessionId?: number, autoAttachSession?: boolean, strengthMachineId: number, exerciseId?: number, facilityId?: number, version: string, serial: string, completedAt: Date, chest?: number, rom1?: number, rom2?: number, seat?: number, resistance: number, resistancePrecision: ResistancePrecision, repetitionCount: number, forceUnit: ForceUnit, peakPower: number, work: number, distance?: number, addedWeight?: number}) {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:create', { ...params, userId : this.id }) as StrengthMachineDataSetResponse
    return new StrengthMachineDataSet(strengthMachineDataSet, this.sessionHandler, this.id)
  }

  async getStrengthMachineDataSets (options: {from?: Date, to?: Date, sort?: StrengthMachineDataSetSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthMachineDataSets, strengthMachineDataSetsMeta } = await this.action('strengthMachineDataSet:list', { ...options, userId : this.id }) as StrengthMachineDataSetListResponse
    return new StrengthMachineDataSets(strengthMachineDataSets, strengthMachineDataSetsMeta, this.sessionHandler, this.id)
  }
}
