import { ForceUnit } from '../constants'
import { ClientSideActionPrevented } from '../error'
import { compressDeflateToB64 } from '../lib/compress'
import { XOR } from '../lib/types'
import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler, StrengthMachineSession } from '../session'
import { A500SetData } from './a500DataSet'
import { A500TimeSeriesPointSample } from './a500TimeSeriesPoint'
import { AcceptedTermsVersion, AcceptedTermsVersionData, AcceptedTermsVersionResponse } from './acceptedTermsVersion'
import { EmailAddress, EmailAddressData, EmailAddresses, EmailAddressListResponse, EmailAddressResponse, EmailAddressSorting } from './emailAddress'
import { FacilityRelationship, FacilityRelationshipData, FacilityRelationshipResponse, UserFacilityEmployeeRelationship, UserFacilityEmployeeRelationships, UserFacilityMemberRelationship, UserFacilityMemberRelationships, UserFacilityRelationshipListResponse, UserFacilityRelationshipSorting } from './facilityRelationship'
import { FacilityInitiatedFacilityRelationshipRequest, FacilityInitiatedFacilityRelationshipRequests, FacilityInitiatedFacilityRelationshipRequestSorting, FacilityRelationshipRequestListResponse, FacilityRelationshipRequestResponse } from './facilityRelationshipRequest'
import { GlobalAccessControl, GlobalAccessControlResponse } from './globalAccessControl'
import { HeartRateCapturedDataPoint, HeartRateDataSet, HeartRateDataSetListResponse, HeartRateDataSetResponse, HeartRateDataSets, HeartRateDataSetSorting } from './heartRateDataSet'
import { HeightMeasurement, HeightMeasurementData, HeightMeasurementListResponse, HeightMeasurementResponse, HeightMeasurements, HeightMeasurementSorting } from './heightMeasurement'
import { MSeriesCapturedDataPoint, MSeriesDataSet, MSeriesDataSetListResponse, MSeriesDataSetResponse, MSeriesDataSets, MSeriesDataSetSorting } from './mSeriesDataSet'
import { MSeriesFtpMeasurement, MSeriesFtpMeasurementListResponse, MSeriesFtpMeasurementResponse, MSeriesFtpMeasurements, MSeriesFtpMeasurementSorting } from './mSeriesFtpMeasurement'
import { OAuthProviders, OAuthService, OAuthServiceData, OAuthServiceListResponse, OAuthServiceResponse, OAuthServices } from './oauthService'
import { PrimaryEmailAddress, PrimaryEmailAddressData, PrimaryEmailAddressResponse } from './primaryEmailAddress'
import { Profile, ProfileData, StaticProfile } from './profile'
import { FacilitySession, FacilitySessions, Session, SessionListResponse, SessionRequireExtendedDataType, SessionResponse, Sessions, SessionSorting, SessionStartResponse } from './session'
import { ResistancePrecision, StrengthMachineDataSet, StrengthMachineDataSetListResponse, StrengthMachineDataSetResponse, StrengthMachineDataSets, StrengthMachineDataSetSorting } from './strengthMachineDataSet'
import { UserInBodyIntegration, UserInBodyIntegrationResponse } from './userInBodyIntegration'
import { WeightMeasurement, WeightMeasurementData, WeightMeasurementListResponse, WeightMeasurementResponse, WeightMeasurements, WeightMeasurementSorting } from './weightMeasurement'

/** @hidden */
export const enum UserSorting {
  ID = 'id',
  Name = 'name',
  CreatedAt = 'createdAt'
}

export interface UserData {
  id: number
  emailAddresses?: EmailAddressData[]
  primaryEmailAddress?: PrimaryEmailAddressData
  basicCredential?: boolean
  oauthServices?: OAuthServiceData[]
  profile: ProfileData
  acceptedTermsVersion?: AcceptedTermsVersionData
  weightMeasurements?: WeightMeasurementData[]
  heightMeasurements?: HeightMeasurementData[]
  facilityRelationships?: FacilityRelationshipData[]
}

export interface UserResponse extends AuthenticatedResponse {
  user: UserData
}

export interface FacilityUserResponse extends AuthenticatedResponse {
  user: UserData
  facilityRelationshipId: number
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
export class Users extends ModelList<User, UserData, UserListResponseMeta> {
  constructor (users: UserData[], usersMeta: UserListResponseMeta, sessionHandler: SessionHandler) {
    super(User, users, usersMeta, sessionHandler)
  }
}

export interface OAuthConnectResponse extends AuthenticatedResponse {
  url: string
}

export class User extends Model {
  private _userData: UserData
  private readonly _isSessionUser: boolean

  constructor (userData: UserData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._userData = userData
    this._isSessionUser = this.id === this.sessionHandler.userId
  }

  private setUserData (userData: UserData) {
    this._userData = userData
  }

  async reload () {
    const { user } = await this.action('user:show', { userId: this.id }) as UserResponse
    this.setUserData(user)
    return this
  }

  async addBasicLogin (params: { email: string, password: string }) {
    if (!this._isSessionUser) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot set basic login for other users' })
    }

    const { user } = await this.action('auth:connect', { ...params }) as UserResponse
    this.setUserData(user)
  }

  async changePassword (params: { password: string }) {
    if (!this._isSessionUser) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot change password for other users' })
    }

    const { user } = await this.action('auth:update', { ...params }) as UserResponse
    this.setUserData(user)
  }

  async delete () {
    if (!this._isSessionUser && this.id !== this._userData.id) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot delete other user without admin privileges' })
    }

    await this.action('user:delete', { userId: this.id })
  }

  ejectData () {
    return { ...this._userData }
  }

  get id () {
    return this._userData.id
  }

  async createEmailAddress (params: { email: string }) {
    const { emailAddress } = await this.action('emailAddress:create', { ...params, userId: this.id }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.sessionHandler)
  }

  async getEmailAddresses (options: { email?: string, sort?: EmailAddressSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { emailAddresses, emailAddressesMeta } = await this.action('emailAddress:list', { ...options, userId: this.id }) as EmailAddressListResponse
    return new EmailAddresses(emailAddresses, emailAddressesMeta, this.sessionHandler)
  }

  eagerPrimaryEmailAddress () {
    return typeof this._userData.primaryEmailAddress !== 'undefined' ? new PrimaryEmailAddress(this._userData.primaryEmailAddress, this.sessionHandler) : undefined
  }

  async getPrimaryEmailAddress () {
    const { primaryEmailAddress } = await this.action('primaryEmailAddress:show', { userId: this.id }) as PrimaryEmailAddressResponse
    return new PrimaryEmailAddress(primaryEmailAddress, this.sessionHandler)
  }

  get basicCredential () {
    return this._userData.basicCredential === true
  }

  eagerOAuthServices () {
    return typeof this._userData.oauthServices !== 'undefined' ? this._userData.oauthServices.map(oauthService => new OAuthService(oauthService, this.sessionHandler)) : undefined
  }

  async createOAuthService (params: { service: OAuthProviders, redirect: string }) {
    if (!this._isSessionUser) {
      throw new ClientSideActionPrevented({ explanation: 'Cannot initialized OAuth connection for other users' })
    }

    const response = await this.action('oauth:initiate', { ...params, type: 'connect' }) as OAuthConnectResponse
    return response.url
  }

  async getOAuthService (params: { id: number }) {
    const { oauthService } = await this.action('oauthService:show', { ...params, userId: this.id }) as OAuthServiceResponse
    return new OAuthService(oauthService, this.sessionHandler)
  }

  async getOAuthServices (options: { service?: OAuthProviders, limit?: number, offset?: number } = { }) {
    const { oauthServices, oauthServicesMeta } = await this.action('oauthService:list', { ...options, userId: this.id }) as OAuthServiceListResponse
    return new OAuthServices(oauthServices, oauthServicesMeta, this.sessionHandler)
  }

  eagerProfile () {
    return new Profile(this._userData.profile, this.sessionHandler)
  }

  eagerAcceptedTermsVersion () {
    return typeof this._userData.acceptedTermsVersion !== 'undefined' ? new AcceptedTermsVersion(this._userData.acceptedTermsVersion, this.sessionHandler) : undefined
  }

  async createAcceptedTermsVersion (params: { revision: string }) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { ...params, userId: this.id }) as AcceptedTermsVersionResponse
    return new AcceptedTermsVersion(acceptedTermsVersion, this.sessionHandler)
  }

  eagerWeightMeasurements () {
    return typeof this._userData.weightMeasurements !== 'undefined' ? this._userData.weightMeasurements.map(weightMeasurement => new WeightMeasurement(weightMeasurement, this.sessionHandler)) : undefined
  }

  async createWeightMeasurement (params: { source: string, takenAt: Date, bodyFatPercentage?: number } & XOR<{ metricWeight: number }, { imperialWeight: number }>) {
    const { weightMeasurement } = await this.action('weightMeasurement:create', { ...params, userId: this.id }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.sessionHandler)
  }

  async getWeightMeasurement (params: { id: number }) {
    const { weightMeasurement } = await this.action('weightMeasurement:show', { ...params, userId: this.id }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.sessionHandler)
  }

  async getWeightMeasurements (options: { from?: Date, to?: Date, sort?: WeightMeasurementSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { weightMeasurements, weightMeasurementsMeta } = await this.action('weightMeasurement:list', { ...options, userId: this.id }) as WeightMeasurementListResponse
    return new WeightMeasurements(weightMeasurements, weightMeasurementsMeta, this.sessionHandler)
  }

  async createWeightMeasurementFromInBody (params: { bodyComp: object }) {
    const { weightMeasurement } = await this.action('weightMeasurement:importInBody', { jsonString: JSON.stringify(params.bodyComp), userId: this.id }) as WeightMeasurementResponse
    return new WeightMeasurement(weightMeasurement, this.sessionHandler)
  }

  async createWeightMeasurementsFromInBodyCSV (params: { bodyCompCSV: string }) {
    const { weightMeasurements, weightMeasurementsMeta } = await this.action('weightMeasurement:importInBodyCSV', { csvString: params.bodyCompCSV, userId: this.id }) as WeightMeasurementListResponse
    return new WeightMeasurements(weightMeasurements, weightMeasurementsMeta, this.sessionHandler)
  }

  eagerHeightMeasurements () {
    return typeof this._userData.heightMeasurements !== 'undefined' ? this._userData.heightMeasurements.map(heightMeasurement => new HeightMeasurement(heightMeasurement, this.sessionHandler)) : undefined
  }

  async createHeightMeasurement (params: { source: string, takenAt: Date, bodyFatPercentage?: number } & XOR<{ metricHeight: number }, { imperialHeight: number }>) {
    const { heightMeasurement } = await this.action('heightMeasurement:create', { ...params, userId: this.id }) as HeightMeasurementResponse
    return new HeightMeasurement(heightMeasurement, this.sessionHandler)
  }

  async getHeightMeasurement (params: { id: number }) {
    const { heightMeasurement } = await this.action('heightMeasurement:show', { ...params, userId: this.id }) as HeightMeasurementResponse
    return new HeightMeasurement(heightMeasurement, this.sessionHandler)
  }

  async getHeightMeasurements (options: { from?: Date, to?: Date, sort?: HeightMeasurementSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { heightMeasurements, heightMeasurementsMeta } = await this.action('heightMeasurement:list', { ...options, userId: this.id }) as HeightMeasurementListResponse
    return new HeightMeasurements(heightMeasurements, heightMeasurementsMeta, this.sessionHandler)
  }

  async getFacilityRelationshipRequest (params: { id: number }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:userShow', { ...params, userId: this.id }) as FacilityRelationshipRequestResponse
    return new FacilityInitiatedFacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
  }

  async getFacilityRelationshipRequests (options: { memberIdentifier?: string, name?: string, sort?: FacilityInitiatedFacilityRelationshipRequestSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationshipRequests, facilityRelationshipRequestsMeta } = await this.action('facilityRelationshipRequest:userList', options) as FacilityRelationshipRequestListResponse
    return new FacilityInitiatedFacilityRelationshipRequests(facilityRelationshipRequests, facilityRelationshipRequestsMeta, this.sessionHandler)
  }

  async getFacilityRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { ...params, userId: this.id }) as FacilityRelationshipResponse
    return new FacilityRelationship(facilityRelationship, this.sessionHandler)
  }

  async getFacilityMembershipRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { ...params, userId: this.id }) as FacilityRelationshipResponse
    return new UserFacilityMemberRelationship(facilityRelationship, this.sessionHandler)
  }

  async getFacilityMembershipRelationships (options: { sort?: UserFacilityRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:userList', { ...options, member: true, userId: this.id }) as UserFacilityRelationshipListResponse
    return new UserFacilityMemberRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getFacilityEmployeeRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { ...params, userId: this.id }) as FacilityRelationshipResponse
    return new UserFacilityEmployeeRelationship(facilityRelationship, this.sessionHandler)
  }

  async getFacilityEmploymentRelationships (options: { name?: string, sort?: UserFacilityRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:userList', { ...options, employee: true, userId: this.id }) as UserFacilityRelationshipListResponse
    return new UserFacilityEmployeeRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async startSession (params: { forceEndPrevious?: boolean, sessionPlanSequenceAssignmentId?: number } = { }) {
    const { session } = await this.action('session:start', { ...params, userId: this.id }) as SessionResponse
    return {
      session: new Session(session, this.sessionHandler)
    }
  }

  async getSession (params: { id: number }) {
    const { session } = await this.action('session:show', { ...params, userId: this.id }) as SessionResponse
    return new Session(session, this.sessionHandler)
  }

  async getSessions (options: { open?: boolean, requireExtendedDataType?: SessionRequireExtendedDataType, from?: Date, to?: Date, sort?: SessionSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { sessions, sessionsMeta } = await this.action('session:list', { ...options, userId: this.id }) as SessionListResponse
    return new Sessions(sessions, sessionsMeta, this.sessionHandler)
  }

  async createMSeriesDataSet (params: { sessionId?: number, autoAttachSession?: boolean, source: string, machineType: string, ordinalId: number, buildMajor: number, buildMinor: number, mSeriesDataPoints: MSeriesCapturedDataPoint[] }) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:create', { ...params, mSeriesDataPoints: JSON.stringify(params.mSeriesDataPoints), userId: this.id }) as MSeriesDataSetResponse
    return new MSeriesDataSet(mSeriesDataSet, this.sessionHandler)
  }

  async getMSeriesDataSet (params: { id: number, graphResolution?: number }) {
    const { mSeriesDataSet } = await this.action('mSeriesDataSet:show', { id: params.id, graph: params.graphResolution ?? 200, userId: this.id }) as MSeriesDataSetResponse
    return new MSeriesDataSet(mSeriesDataSet, this.sessionHandler)
  }

  async getMSeriesDataSets (options: { source?: string, from?: Date, sort?: MSeriesDataSetSorting, ascending?: boolean, to?: Date, limit?: number, offset?: number } = { }) {
    const { mSeriesDataSets, mSeriesDataSetsMeta } = await this.action('mSeriesDataSet:list', { ...options, userId: this.id }) as MSeriesDataSetListResponse
    return new MSeriesDataSets(mSeriesDataSets, mSeriesDataSetsMeta, this.sessionHandler)
  }

  async createMSeriesFtpMeasurement (params: { source: string, takenAt: Date, machineType: string, ftp: number }) {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:create', { ...params, userId: this.id }) as MSeriesFtpMeasurementResponse
    return new MSeriesFtpMeasurement(mSeriesFtpMeasurement, this.sessionHandler)
  }

  async getMSeriesFtpMeasurement (params: { id: number }) {
    const { mSeriesFtpMeasurement } = await this.action('mSeriesFtpMeasurement:show', { ...params, userId: this.id }) as MSeriesFtpMeasurementResponse
    return new MSeriesFtpMeasurement(mSeriesFtpMeasurement, this.sessionHandler)
  }

  async getMSeriesFtpMeasurements (options: { source?: string, machineType?: string, from?: Date, to?: Date, sort?: MSeriesFtpMeasurementSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta } = await this.action('mSeriesFtpMeasurement:list', { ...options, userId: this.id }) as MSeriesFtpMeasurementListResponse
    return new MSeriesFtpMeasurements(mSeriesFtpMeasurements, mSeriesFtpMeasurementsMeta, this.sessionHandler)
  }

  async createHeartRateDataSet (params: { sessionId?: number, autoAttachSession?: boolean, source: string, heartRateDataPoints: HeartRateCapturedDataPoint[] }) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:create', { ...params, heartRateDataPoints: JSON.stringify(params.heartRateDataPoints), userId: this.id }) as HeartRateDataSetResponse
    return new HeartRateDataSet(heartRateDataSet, this.sessionHandler)
  }

  async getHeartRateDataSet (params: { id: number }) {
    const { heartRateDataSet } = await this.action('heartRateDataSet:show', { ...params, userId: this.id }) as HeartRateDataSetResponse
    return new HeartRateDataSet(heartRateDataSet, this.sessionHandler)
  }

  async getHeartRateDataSets (options: { source?: string, from?: Date, to?: Date, sort?: HeartRateDataSetSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { heartRateDataSets, heartRateDataSetsMeta } = await this.action('heartRateDataSet:list', { ...options, userId: this.id }) as HeartRateDataSetListResponse
    return new HeartRateDataSets(heartRateDataSets, heartRateDataSetsMeta, this.sessionHandler)
  }

  async createStrengthMachineDataSet (params: { sessionId?: number, autoAttachSession?: boolean, strengthMachineId: number, exerciseId?: number, facilityId?: number, version: string, serial: string, completedAt: Date, chest?: number, rom1?: number, rom2?: number, seat?: number, resistance: number, resistancePrecision: ResistancePrecision, repetitionCount: number, forceUnit: ForceUnit, peakPower: number, work: number, distance?: number, addedWeight?: number }) {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:create', { ...params, userId: this.id }) as StrengthMachineDataSetResponse
    return new StrengthMachineDataSet(strengthMachineDataSet, this.sessionHandler)
  }

  async getStrengthMachineDataSet (params: { id: number }) {
    const { strengthMachineDataSet } = await this.action('strengthMachineDataSet:show', { ...params, userId: this.id }) as StrengthMachineDataSetResponse
    return new StrengthMachineDataSet(strengthMachineDataSet, this.sessionHandler)
  }

  async getStrengthMachineDataSets (options: { from?: Date, to?: Date, sort?: StrengthMachineDataSetSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthMachineDataSets, strengthMachineDataSetsMeta } = await this.action('strengthMachineDataSet:list', { ...options, userId: this.id }) as StrengthMachineDataSetListResponse
    return new StrengthMachineDataSets(strengthMachineDataSets, strengthMachineDataSetsMeta, this.sessionHandler)
  }

  async getGlobalAccessControl () {
    const { globalAccessControl } = await this.action('globalAccessControl:show', { userId: this.id }) as GlobalAccessControlResponse
    return new GlobalAccessControl(globalAccessControl, this.sessionHandler)
  }
}

export class FacilityUser extends User {
  protected _facilityRelationshipId: number

  constructor (userData: UserData, sessionHandler: SessionHandler, facilityRelationshipId: number) {
    super(userData, sessionHandler)
    this._facilityRelationshipId = facilityRelationshipId
  }

  get facilityRelationshipId () {
    return this._facilityRelationshipId
  }
}

export class FacilityMemberUser extends FacilityUser {
  async startSession (params: { forceEndPrevious?: boolean, echipId?: string, sessionPlanSequenceAssignmentId?: number } = { }) {
    const { session, echipData } = await this.action('facilitySession:start', { ...params, userId: this.id }) as SessionStartResponse
    return {
      session: new FacilitySession(session, this.sessionHandler),
      echipData
    }
  }

  async getSession (params: { id: number }) {
    const { session } = await this.action('facilitySession:show', params) as SessionResponse
    return new FacilitySession(session, this.sessionHandler)
  }

  async getCurrentSessions () {
    const { sessions, sessionsMeta } = await this.action('facilitySession:status', { userId: this.id }) as SessionListResponse
    return new FacilitySessions(sessions, sessionsMeta, this.sessionHandler)
  }

  async getInBodyIntegration () {
    const { userInBodyIntegration } = await this.action('userInBodyIntegration:show', { userId: this.id }) as UserInBodyIntegrationResponse
    return new UserInBodyIntegration(userInBodyIntegration, this.sessionHandler, this.facilityRelationshipId)
  }

  async createInBodyIntegration (params: { userToken: string }) {
    const { userInBodyIntegration } = await this.action('userInBodyIntegration:create', { ...params, userId: this.id }) as UserInBodyIntegrationResponse
    return new UserInBodyIntegration(userInBodyIntegration, this.sessionHandler, this.facilityRelationshipId)
  }

  async createA500Set (params: { strengthMachineSession: StrengthMachineSession, setData: A500SetData, sampleData?: A500TimeSeriesPointSample[] }) {
    const machineToken = params.strengthMachineSession.sessionHandler.accessToken
    const setData = JSON.stringify(params.setData)
    const deflatedSampleData = typeof params.sampleData !== 'undefined' ? compressDeflateToB64(params.sampleData) : null
    const response = await this.action('strengthMachineDataSet:createA500', { userId: this.id, machineToken, setData, deflatedSampleData }) as StrengthMachineDataSetResponse
    return new StrengthMachineDataSet(response.strengthMachineDataSet, this.sessionHandler)
  }
}

export class FacilityEmployeeUser extends FacilityUser {

}

export class StaticUser {
  private readonly _userData: UserData

  constructor (userData: UserData) {
    this._userData = userData
  }

  get profile () {
    return new StaticProfile(this._userData.profile)
  }
}
