import { SimpleEventDispatcher } from 'ste-simple-events'
import { MetricsConnection } from './connection'
import { JWT_TTL_LIMIT } from './constants'
import { ClientSideActionPrevented, SessionError } from './error'
import { DecodeJWT } from './lib/jwt'
import { Cache, CacheKeysResponse, CacheObjectResponse } from './models/cache'
import { CardioExercise, CardioExerciseListResponse, CardioExerciseResponse, CardioExercises, CardioExerciseSorting, PrivilegedCardioExercise, PrivilegedCardioExercises } from './models/cardioExercise'
import { CardioExerciseMuscle, CardioExerciseMuscleResponse, PrivilegedCardioExerciseMuscle } from './models/cardioExerciseMuscle'
import { CardioExerciseVariant, CardioExerciseVariantResponse, PrivilegedCardioExerciseVariant } from './models/cardioExerciseVariant'
import { CardioMachine, CardioMachineListResponse, CardioMachineResponse, CardioMachines, CardioMachineSorting } from './models/cardioMachine'
import { ExerciseAlias, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, ExerciseAliasType, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './models/exerciseAlias'
import { ExerciseOrdinalSet, ExerciseOrdinalSetListResponse, ExerciseOrdinalSetResponse, ExerciseOrdinalSets, ExerciseOrdinalSetSorting, PrivilegedExerciseOrdinalSet, PrivilegedExerciseOrdinalSets } from './models/exerciseOrdinalSet'
import { ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentResponse, PrivilegedExerciseOrdinalSetAssignment } from './models/exerciseOrdinalSetAssignment'
import { Facilities, Facility, FacilityData, FacilityListResponse, FacilityResponse, FacilitySorting, PrivilegedFacility } from './models/facility'
import { FacilityLicense, FacilityLicenseListResponse,FacilityLicenseResponse, FacilityLicenses, FacilityLicenseSorting , LicenseType } from './models/facilityLicense'
import { SessionResponse, StaticSession } from './models/session'
import { StatListResponse, Stats, StatSorting } from './models/stat'
import { PrivilegedStrengthExercise, PrivilegedStrengthExercises, StrengthExercise, StrengthExerciseCategory, StrengthExerciseListResponse, StrengthExerciseMovement, StrengthExercisePlane, StrengthExerciseResponse, StrengthExercises, StrengthExerciseSorting } from './models/strengthExercise'
import { PrivilegedStrengthExerciseMuscle, StrengthExerciseMuscle, StrengthExerciseMuscleResponse } from './models/strengthExerciseMuscle'
import { PrivilegedStrengthExerciseVariant, StrengthExerciseVariant, StrengthExerciseVariantResponse } from './models/strengthExerciseVariant'
import { StrengthMachine, StrengthMachineListResponse, StrengthMachineResponse, StrengthMachines, StrengthMachineSorting } from './models/strengthMachine'
import { PrivilegedStretchExercise, PrivilegedStretchExercises, StretchExercise, StretchExerciseListResponse, StretchExerciseResponse, StretchExercises, StretchExerciseSorting } from './models/stretchExercise'
import { PrivilegedStretchExerciseMuscle, StretchExerciseMuscle, StretchExerciseMuscleResponse } from './models/stretchExerciseMuscle'
import { PrivilegedStretchExerciseVariant, StretchExerciseVariant, StretchExerciseVariantResponse } from './models/stretchExerciseVariant'
import { FailedTasks, Queue, ResqueDetailsResponse, TaskFailedResponse, TaskQueueResponse, Tasks, WorkersResponse } from './models/task'
import { OAuthProviders, User, UserListResponse, UserResponse, Users, UserSorting } from './models/user'

export interface AuthenticatedResponse {
  accessToken: string
  refreshToken?: string
}

export interface FacilityKioskTokenResponse extends AuthenticatedResponse {
  kioskToken: string
}

export interface OAuthLoginResponse {
  url: string
}

export interface RefreshTokenChangeEvent {
  refreshToken: string
}

export interface KioskTokenChangeEvent {
  kioskToken: string
}

export interface JWTToken {
  user: { id: number }
  facility: FacilityData | null
  facilityRole: string | null
  type: 'access' | 'refresh'
  iat: number
  exp: number
  iss: string
  jti: string
  superUser?: boolean
}

export interface AccessToken extends JWTToken {
  type: 'access'
}

export interface RefreshToken extends JWTToken {
  type: 'refresh'
}

export interface KioskToken {
  facility: FacilityData
  type: 'kiosk'
  iat: number
  exp: number
  iss: string
  jti: string
}

export class Authentication {
  static async useCredentials (connection: MetricsConnection, params: {email: string, password: string, refreshable: boolean}) {
    const response = await connection.action('auth:login', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async useToken (connection: MetricsConnection, params: { token: string }) {
    const response = await connection.action('user:show', { authorization: params.token }) as UserResponse
    return new UserSession(response, connection)
  }

  static async useResetToken (connection: MetricsConnection, params: { resetToken: string, password: string, refreshable: boolean}) {
    const response = await connection.action('auth:resetFulfillment', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async useWelcomeToken (connection: MetricsConnection, params: { welcomeToken: string, password: string, refreshable: boolean}) {
    const response = await connection.action('auth:facilityWelcomeFulfillment', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async useKioskToken (connection: MetricsConnection, params: { kioskToken: string }) {
    await connection.action('facilityKioskToken:check', { authorization: params.kioskToken })
    return new KioskSession(params, connection)
  }

  static async useOAuth (connection: MetricsConnection, params: {service: OAuthProviders, redirect: string}) {
    const response = await connection.action('oauth:initiate', { ...params, type: 'login' }) as OAuthLoginResponse
    return response.url
  }

  static async createUser (connection: MetricsConnection, params: {email: string, password: string, refreshable: boolean}) {
    const response = await connection.action('user:create', params) as UserResponse
    return new UserSession(response, connection)
  }

  static async passwordReset (connection: MetricsConnection, params: {email: string}) {
    await connection.action('auth:resetRequest', params)
  }

  /** @hidden */
  static async useAdminCredentials (connection: MetricsConnection, params: {email: string, password: string, token: string, refreshable: boolean}) {
    const response = await connection.action('admin:login', params) as UserResponse
    return new AdminSession(response, connection)
  }

  /** @hidden */
  static async useAdminToken (connection: MetricsConnection, params: { token: string}) {
    const response = await connection.action('user:show', { authorization: params.token }) as UserResponse
    const accessToken = DecodeJWT(response.accessToken) as AccessToken
    if (accessToken?.superUser !== true) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for super-user actions.' })
    }
    return new AdminSession(response, connection)
  }
}

export class SessionHandler {
  private _connection: MetricsConnection
  private _keepAlive: boolean = true
  private _accessToken: string = ''
  private _refreshToken: string | null = null
  private _accessTokenTimeout: ReturnType<typeof setTimeout> | null = null
  private _onRefreshTokenChangeEvent = new SimpleEventDispatcher<RefreshTokenChangeEvent>()
  private _userId: number | null = null

  constructor (connection: MetricsConnection, loginResponse: UserResponse) {
    this._connection = connection
    this._connection.onDisposeEvent.one(() => this.close())
    this.updateTokens(loginResponse)
  }

  private updateTokens (response: AuthenticatedResponse) {
    if (response.accessToken) {
      this._accessToken = response.accessToken

      if (this._accessTokenTimeout) {
        clearTimeout(this._accessTokenTimeout)
      }

      if (this._keepAlive) {
        const tokenTTL = this.decodedAccessToken.exp * 1000 - Date.now() - JWT_TTL_LIMIT
        this._accessTokenTimeout = setTimeout(() => this.keepAccessTokenAlive(), tokenTTL)
      }

      if (response.refreshToken) {
        this._refreshToken = response.refreshToken
        this._onRefreshTokenChangeEvent.dispatchAsync({ refreshToken: this._refreshToken })
      }
    }
  }

  private async keepAccessTokenAlive () {
    if (this._keepAlive) {
      try {
        await this.action('auth:keepAlive')
      } catch (error) {
        return
      }
    }
  }

  get connection () {
    return this._connection
  }

  get keepAlive () {
    return this._keepAlive
  }

  set keepAlive (value: boolean) {
    this._keepAlive = value
    if (!this._keepAlive && this._accessTokenTimeout) {
      clearTimeout(this._accessTokenTimeout)
    }
  }

  get decodedAccessToken () {
    return DecodeJWT(this._accessToken) as AccessToken
  }

  get refreshToken () {
    return this._refreshToken
  }

  get decodedRefreshToken () {
    return this._refreshToken ? DecodeJWT(this._refreshToken) as RefreshToken : undefined
  }

  get onRefreshTokenChangeEvent () {
    return this._onRefreshTokenChangeEvent.asEvent()
  }

  get userId () {
    return this._userId ?? (this._userId = this.decodedAccessToken.user.id)
  }

  close () {
    this.keepAlive = false
    this._accessToken = ''
    this._refreshToken = null
  }

  async logout () {
    const authParams = { authorization: this._refreshToken ?? this._accessToken }
    await this._connection.action('auth:logout', authParams)
    this.close()
  }

  async action (action: string, params: Object = {}) {
    let response
    try {
      const authParams = { authorization: this._accessToken, ...params }
      response = await this._connection.action(action, authParams) as AuthenticatedResponse
    } catch (error) {
      if (error instanceof SessionError && this._refreshToken && (DecodeJWT(this._refreshToken) as RefreshToken).exp * 1000 - Date.now() > 0) {
        const authParams = { authorization: this._refreshToken, ...params }
        response = await this._connection.action(action, authParams) as AuthenticatedResponse
      } else {
        throw error
      }
    }
    this.updateTokens(response)
    return response
  }
}

export class KioskSessionHandler {
  private _connection: MetricsConnection
  private _kioskToken: string = ''
  private _onKioskTokenChangeEvent = new SimpleEventDispatcher<KioskTokenChangeEvent>()

  constructor (connection: MetricsConnection, { kioskToken }: { kioskToken: string }) {
    this._connection = connection
    this._connection.onDisposeEvent.one(() => this.close())
    this.updateToken(kioskToken)
  }

  private updateToken (kioskToken: string) {
    this._kioskToken = kioskToken
    this._onKioskTokenChangeEvent.dispatchAsync({ kioskToken: this._kioskToken })
  }

  get connection () {
    return this._connection
  }

  get decodedKioskToken () {
    return DecodeJWT(this._kioskToken) as KioskToken
  }

  get kioskToken () {
    return this._kioskToken
  }

  get onKioskTokenChangeEvent () {
    return this._onKioskTokenChangeEvent.asEvent()
  }

  close () {
    this._kioskToken = ''
  }

  async logout () {
    const authParams = { authorization: this._kioskToken }
    await this._connection.action('facilityKioskToken:delete', authParams)
    this.close()
  }

  async action (action: string, params: Object = {}) {
    const authParams = { authorization: this._kioskToken, ...params }
    return await this._connection.action(action, authParams) as AuthenticatedResponse
  }
}

export class KioskSession {
  private _sessionHandler: KioskSessionHandler

  constructor ({ kioskToken }: { kioskToken: string }, connection: MetricsConnection) {
    this._sessionHandler = new KioskSessionHandler(connection, { kioskToken })
  }

  get sessionHandler () {
    return this._sessionHandler
  }

  close () {
    this._sessionHandler.close()
  }

  async logout () {
    await this._sessionHandler.logout()
  }

  private action (action: string, params: Object = {}) {
    return this.sessionHandler.action(action, params)
  }

  async userLogin (params: {primaryIdentification: string | number, secondaryIdentification?: string | number}) {
    const response = await this.action('facilityKiosk:userLogin', params) as UserResponse
    return new UserSession(response, this.sessionHandler.connection)
  }

  async sessionUpdate (params: {echipId: string, echipData: object}) {
    const { session } = await this.action('facilityKiosk:sessionUpdateEchip', { echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as SessionResponse
    return new StaticSession(session)
  }

  async sessionEnd (params: {echipId: string, echipData: object}) {
    const { session } = await this.action('facilityKiosk:sessionEndEchip', { echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as SessionResponse
    return new StaticSession(session)
  }
}

export class UserSession {
  private _sessionHandler: SessionHandler
  private _user: User

  constructor (loginResponse: UserResponse, connection: MetricsConnection) {
    this._sessionHandler = new SessionHandler(connection, loginResponse)
    this._user = new User(loginResponse.user, this._sessionHandler)
  }

  get sessionHandler () {
    return this._sessionHandler
  }

  get keepAlive () {
    return this._sessionHandler.keepAlive
  }

  set keepAlive (value: boolean) {
    this._sessionHandler.keepAlive = value
  }

  get refreshToken () {
    return this._sessionHandler.refreshToken
  }

  get onRefreshTokenChangeEvent () {
    return this._sessionHandler.onRefreshTokenChangeEvent
  }

  close () {
    this._sessionHandler.close()
  }

  async logout () {
    await this._sessionHandler.logout()
  }

  get user () {
    return this._user
  }

  get activeFacility () {
    return this._sessionHandler.decodedAccessToken.facility ? new PrivilegedFacility(this._sessionHandler.decodedAccessToken.facility, this._sessionHandler) : undefined
  }

  protected action (action: string, params: Object = {}) {
    return this.sessionHandler.action(action, params)
  }

  async getExerciseAlias (params: {id: number}) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: {alias?: string, type?: ExerciseAliasType, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async getExerciseOrdinalSetAssignment (params: {id: number}) {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:show', params) as ExerciseOrdinalSetAssignmentResponse
    return new ExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)
  }

  async getExerciseOrdinalSet (params: {id: number}) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:show', params) as ExerciseOrdinalSetResponse
    return new ExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getExerciseOrdinalSets (options: {code?: string, name?: string, sort?: ExerciseOrdinalSetSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseOrdinalSets, exerciseOrdinalSetsMeta } = await this.action('exerciseOrdinalSet:list', options) as ExerciseOrdinalSetListResponse
    return new ExerciseOrdinalSets(exerciseOrdinalSets, exerciseOrdinalSetsMeta, this.sessionHandler)
  }

  async getStrengthExercise (params: {id: number}) {
    const { strengthExercise } = await this.action('strengthExercise:show', params) as StrengthExerciseResponse
    return new StrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExercises (options: {defaultAlias?: string, category?: StrengthExerciseCategory, movement?: StrengthExerciseMovement, plane?: StrengthExercisePlane, sort?: StrengthExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthExercises, strengthExercisesMeta } = await this.action('strengthExercise:list', options) as StrengthExerciseListResponse
    return new StrengthExercises(strengthExercises, strengthExercisesMeta, this.sessionHandler)
  }

  async getStrengthMachine (params: {id: number}) {
    const { strengthMachine } = await this.action('strengthMachine:show', params) as StrengthMachineResponse
    return new StrengthMachine(strengthMachine, this.sessionHandler)
  }

  async getStrengthMachines (options: {name?: string, line?: string, variant?: string, sort?: StrengthMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthMachines, strengthMachinesMeta } = await this.action('strengthMachine:list', options) as StrengthMachineListResponse
    return new StrengthMachines(strengthMachines, strengthMachinesMeta, this.sessionHandler)
  }

  async getStrengthExerciseVariant (params: {id: number}) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:show', { ...params }) as StrengthExerciseVariantResponse
    return new StrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)
  }

  async getStrengthExerciseMuscle (params: {id: number}) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { ...params }) as StrengthExerciseMuscleResponse
    return new StrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)
  }

  async getStretchExercise (params: {id: number}) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new StretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new StretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async getStretchExerciseVariant (params: {id: number}) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:show', { ...params }) as StretchExerciseVariantResponse
    return new StretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)
  }

  async getStretchExerciseMuscle (params: {id: number}) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { ...params }) as StretchExerciseMuscleResponse
    return new StretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)
  }

  async getCardioExercise (params: {id: number}) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new CardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: {defaultAlias?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new CardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async getCardioMachine (params: {id: number}) {
    const { cardioMachine } = await this.action('cardioMachine:show', params) as CardioMachineResponse
    return new CardioMachine(cardioMachine, this.sessionHandler)
  }

  async getCardioMachines (options: {name?: string, sort?: CardioMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioMachines, cardioMachinesMeta } = await this.action('cardioMachine:list', options) as CardioMachineListResponse
    return new CardioMachines(cardioMachines, cardioMachinesMeta, this.sessionHandler)
  }

  async getCardioExerciseVariant (params: {id: number}) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:show', { ...params }) as CardioExerciseVariantResponse
    return new CardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)
  }

  async getCardioExerciseMuscle (params: {id: number}) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { ...params }) as CardioExerciseMuscleResponse
    return new CardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getFacility (params: {id: number}) {
    const { facility } = await this.action('facility:show', params) as FacilityResponse
    return new Facility(facility, this.sessionHandler)
  }

  async getFacilities (options: {name?: string, phone?: string, address?: string, city?: string, postcode?: string, state?: string, country?: string, sort?: FacilitySorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { facilities ,facilitiesMeta } = await this.action('facility:list', options) as FacilityListResponse
    return new Facilities(facilities, facilitiesMeta, this.sessionHandler)
  }
}

/** @hidden */
export class AdminSession extends UserSession {

  async getStats (options: {from?: Date, to?: Date, sort?: StatSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stats, statsMeta } = await this.action('stats:list', options) as StatListResponse
    return new Stats(stats, statsMeta, this.sessionHandler)
  }

  async getUser (params: {userId: number}) {
    const { user } = await this.action('user:show', params) as UserResponse
    return new User(user, this.sessionHandler)
  }

  async getUsers (options: {name?: string, email?: string, sort?: UserSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { users, usersMeta } = await this.action('user:list', options) as UserListResponse
    return new Users(users, usersMeta, this.sessionHandler)
  }

  async mergeUsers (params: {fromUserId: number, toUserId: number}) {
    const { user } = await this.action('user:merge', params) as UserResponse
    return new User(user, this.sessionHandler)
  }

  async getCacheKeys (options: {filter?: string} = {}) {
    const { cacheKeys } = await this.action('resque:cache:list') as CacheKeysResponse
    return cacheKeys.filter(key => key.startsWith('cache:' + (options?.filter ?? ''))).map(key => new Cache(key.replace(/$cache:/, ''), this.sessionHandler))
  }

  async getCacheKey (key: string) {
    const { cacheObject } = await this.action('resque:cache:show', { key }) as CacheObjectResponse
    return new Cache(cacheObject.key, this.sessionHandler)
  }

  async createCacheKey (params: {key: string, value: string, expireIn?: number}) {
    const { cacheObject } = await this.action('resque:cache:create', params) as CacheObjectResponse
    return new Cache(cacheObject.key, this.sessionHandler)
  }

  async getResqueDetails () {
    const { details } = await this.action('resque:details') as ResqueDetailsResponse
    return details
  }

  async getWorkers () {
    const { workers } = await this.action('resque:worker:list') as WorkersResponse
    return Object.keys(workers).map(key => ({ worker: key, status: workers[key] }))
  }

  async getTasks (options: {queue: Queue, offset?: number, limit?: number}) {
    const { tasks, tasksMeta } = await this.action('resque:task:queue', options) as TaskQueueResponse
    return new Tasks(tasks, tasksMeta, this.sessionHandler)
  }

  async getFailedTasks (options: {offset?: number, limit?: number} = {}) {
    const { tasks, tasksMeta } = await this.action('resque:task:failures', options) as TaskFailedResponse
    return new FailedTasks(tasks, tasksMeta, this.sessionHandler)
  }

  async retryAllFailedTasks (options: {taskName?: string} = {}) {
    await this.action('resque:task:retryAllFailed', options)
  }

  async deleteAllFailedTasks (options: {taskName?: string} = {}) {
    await this.action('resque:task:deleteAllFailed', options)
  }

  async getExerciseAlias (params: {id: number}) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: {alias?: string, type?: ExerciseAliasType, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async getExerciseOrdinalSetAssignment (params: {id: number}) {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:show', params) as ExerciseOrdinalSetAssignmentResponse
    return new PrivilegedExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)
  }

  async getExerciseOrdinalSet (params: {id: number}) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:show', params) as ExerciseOrdinalSetResponse
    return new PrivilegedExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getExerciseOrdinalSets (options: {code?: string, name?: string, sort?: ExerciseOrdinalSetSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseOrdinalSets, exerciseOrdinalSetsMeta } = await this.action('exerciseOrdinalSet:list', options) as ExerciseOrdinalSetListResponse
    return new PrivilegedExerciseOrdinalSets(exerciseOrdinalSets, exerciseOrdinalSetsMeta, this.sessionHandler)
  }

  async createExerciseOrdinalSet (params: {code: string, name: string, description: string}) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:create', params) as ExerciseOrdinalSetResponse
    return new PrivilegedExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getStrengthExercise (params: {id: number}) {
    const { strengthExercise } = await this.action('strengthExercise:show', params) as StrengthExerciseResponse
    return new PrivilegedStrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExercises (options: { defaultAlias?: string, category?: StrengthExerciseCategory, movement?: StrengthExerciseMovement, plane?: StrengthExercisePlane, sort?: StrengthExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthExercises, strengthExercisesMeta } = await this.action('strengthExercise:list', options) as StrengthExerciseListResponse
    return new PrivilegedStrengthExercises(strengthExercises, strengthExercisesMeta, this.sessionHandler)
  }

  async createStrengthExercise (params: { defaultExerciseAlias: string, category: StrengthExerciseCategory, movement: StrengthExerciseMovement, plane: StrengthExercisePlane }) {
    const { strengthExercise } = await this.action('strengthExercise:create', params) as StrengthExerciseResponse
    return new PrivilegedStrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExerciseVariant (params: {id: number}) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:show', { ...params }) as StrengthExerciseVariantResponse
    return new PrivilegedStrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)
  }

  async getStrengthExerciseMuscle (params: {id: number}) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { ...params }) as StrengthExerciseMuscleResponse
    return new PrivilegedStrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)
  }

  async getStretchExercise (params: {id: number}) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { defaultAlias?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new PrivilegedStretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async createStretchExercise (params: { defaultExerciseAlias: string }) {
    const { stretchExercise } = await this.action('stretchExercise:create', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExerciseVariant (params: {id: number}) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:show', { ...params }) as StretchExerciseVariantResponse
    return new PrivilegedStretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)
  }

  async getStretchExerciseMuscle (params: {id: number}) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { ...params }) as StretchExerciseMuscleResponse
    return new PrivilegedStretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)
  }

  async getCardioExercise (params: {id: number}) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: { defaultAlias?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new PrivilegedCardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async createCardioExercise (params: { defaultExerciseAlias: string }) {
    const { cardioExercise } = await this.action('cardioExercise:create', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExerciseVariant (params: {id: number}) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:show', { ...params }) as CardioExerciseVariantResponse
    return new PrivilegedCardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)
  }

  async getCardioExerciseMuscle (params: {id: number}) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { ...params }) as CardioExerciseMuscleResponse
    return new PrivilegedCardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getFacilityLicense (params: {id: number}) {
    const { facilityLicense } = await this.action('facilityLicense:show', params) as FacilityLicenseResponse
    return new FacilityLicense(facilityLicense, this.sessionHandler)
  }

  async getFacilityLicenses (options: {name?: string, key?: string, type?: LicenseType, accountId?: string, sort?: FacilityLicenseSorting, ascending?: boolean, limit?: number, offset?: number} = {}) {
    const { facilityLicenses, facilityLicensesMeta } = await this.action('facilityLicense:list', options) as FacilityLicenseListResponse
    return new FacilityLicenses(facilityLicenses, facilityLicensesMeta, this.sessionHandler)
  }

  async createFacilityLicense (params: {accountId?: string, term: number, type: LicenseType, name?: string, email?: string}) {
    const { facilityLicense } = await this.action('facilityLicense:create', params) as FacilityLicenseResponse
    return new FacilityLicense(facilityLicense, this.sessionHandler)
  }
}
