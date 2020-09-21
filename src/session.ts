import { SimpleEventDispatcher } from 'ste-simple-events'
import { MetricsConnection } from './connection'
import { JWT_TTL_LIMIT } from './constants'
import { ClientSideActionPrevented, SessionError } from './error'
import { DecodeJWT } from './lib/jwt'
import { Cache, CacheKeysResponse, CacheObjectResponse } from './models/cache'
import { CardioExercise, CardioExerciseListResponse, CardioExerciseResponse, CardioExercises, CardioExerciseSorting, PrivilegedCardioExercise, PrivilegedCardioExercises } from './models/cardioExercise'
import { CardioMachine, CardioMachineLine, CardioMachineListResponse, CardioMachineParseCode, CardioMachineResponse, CardioMachines, CardioMachineSorting, PrivilegedCardioMachine, PrivilegedCardioMachines } from './models/cardioMachine'
import { Exercise, ExerciseListResponse, ExerciseResponse, Exercises, ExerciseSorting, ExerciseType, PrivilegedExercise, PrivilegedExercises } from './models/exercise'
import { ExerciseAlias, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './models/exerciseAlias'
import { ExerciseLaterality, ExerciseMovement, ExercisePlane, ExerciseVariant, ExerciseVariantListResponse, ExerciseVariantResponse, ExerciseVariants, ExerciseVariantSorting, ExerciseVariantType, PrivilegedExerciseVariant, PrivilegedExerciseVariants } from './models/exerciseVariant'
import { Facilities, Facility, FacilityData, FacilityListResponse, FacilityResponse, FacilitySorting, PrivilegedFacility } from './models/facility'
import { FacilityLicense, FacilityLicenseListResponse,FacilityLicenseResponse, FacilityLicenses, FacilityLicenseSorting , LicenseType } from './models/facilityLicense'
import { Muscle, MuscleBodyPart, MuscleGroup, MuscleListResponse, MuscleResponse, Muscles, MuscleSorting, PrivilegedMuscle, PrivilegedMuscles } from './models/muscle'
import { SessionResponse, StaticSession } from './models/session'
import { StatListResponse, Stats, StatSorting } from './models/stat'
import { PrivilegedStrengthMachine, PrivilegedStrengthMachines, StrengthMachine, StrengthMachineLine, StrengthMachineListResponse, StrengthMachineResponse, StrengthMachines, StrengthMachineSorting } from './models/strengthMachine'
import { PrivilegedStretchExercise, PrivilegedStretchExercises, StretchExercise, StretchExerciseListResponse, StretchExerciseResponse, StretchExercises, StretchExerciseSorting } from './models/stretchExercise'
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

  async getExercise (params: {id: number}) {
    const { exercise } = await this.action('exercise:show', params) as ExerciseResponse
    return new Exercise(exercise, this.sessionHandler)
  }

  async getExercises (options: {name?: string, searchAlias?: boolean, type?: ExerciseType, sort?: ExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exercises, exercisesMeta } = await this.action('exercise:list', options) as ExerciseListResponse
    return new Exercises(exercises, exercisesMeta, this.sessionHandler)
  }

  async getExerciseAlias (params: {id: number}) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: {alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async getExerciseVariant (params: {id: number}) {
    const { exerciseVariant } = await this.action('exerciseVariant:show', params) as ExerciseVariantResponse
    return new ExerciseVariant(exerciseVariant, this.sessionHandler)
  }

  async getExerciseVariants (options: { variant?: ExerciseVariantType, laterality?: ExerciseLaterality, movement?: ExerciseMovement, plane?: ExercisePlane, sort?: ExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseVariants, exerciseVariantsMeta } = await this.action('exerciseVariant:list', options) as ExerciseVariantListResponse
    return new ExerciseVariants(exerciseVariants, exerciseVariantsMeta, this.sessionHandler)
  }

  async getStretchExercise (params: {id: number}) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new StretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new StretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async getCardioExercise (params: {id: number}) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new CardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new CardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async getMuscle (params: {id: number}) {
    const { muscle } = await this.action('muscle:show', params) as MuscleResponse
    return new Muscle(muscle, this.sessionHandler)
  }

  async getMuscles (options: {name?: string, group?: MuscleGroup, part?: MuscleBodyPart, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { muscles, musclesMeta } = await this.action('muscle:list', options) as MuscleListResponse
    return new Muscles(muscles, musclesMeta, this.sessionHandler)
  }

  async getStrengthMachine (params: {id: number}) {
    const { strengthMachine } = await this.action('strengthMachine:show', params) as StrengthMachineResponse
    return new StrengthMachine(strengthMachine, this.sessionHandler)
  }

  async getStrengthMachines (options: {name?: string, line?: string, variant?: string, sort?: StrengthMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthMachines, strengthMachinesMeta } = await this.action('strengthMachine:list', options) as StrengthMachineListResponse
    return new StrengthMachines(strengthMachines, strengthMachinesMeta, this.sessionHandler)
  }

  async getCardioMachine (params: {id: number}) {
    const { cardioMachine } = await this.action('cardioMachine:show', params) as CardioMachineResponse
    return new CardioMachine(cardioMachine, this.sessionHandler)
  }

  async getCardioMachines (options: {name?: string, sort?: CardioMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioMachines, cardioMachinesMeta } = await this.action('cardioMachine:list', options) as CardioMachineListResponse
    return new CardioMachines(cardioMachines, cardioMachinesMeta, this.sessionHandler)
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

  async getExercise (params: {id: number}) {
    const { exercise } = await this.action('exercise:show', params) as ExerciseResponse
    return new PrivilegedExercise(exercise, this.sessionHandler)
  }

  async getExercises (options: {name?: string, type?: ExerciseType, sort?: ExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exercises, exercisesMeta } = await this.action('exercise:list', options) as ExerciseListResponse
    return new PrivilegedExercises(exercises, exercisesMeta, this.sessionHandler)
  }

  async createExercise (params: { name: string, type: ExerciseType, variant?: string, exerciseId?: number }) {
    const { exercise } = await this.action('exercise:create', params) as ExerciseResponse
    return new PrivilegedExercise(exercise, this.sessionHandler)
  }

  async getExerciseAlias (params: {id: number}) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: {alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async createExerciseAlias (params: { alias: string, exerciseVariantId?: number }) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', params) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseVariant (params: {id: number}) {
    const { exerciseVariant } = await this.action('exerciseVariant:show', params) as ExerciseVariantResponse
    return new PrivilegedExerciseVariant(exerciseVariant, this.sessionHandler)
  }

  async getExerciseVariants (options: { variant?: ExerciseVariantType, laterality?: ExerciseLaterality, movement?: ExerciseMovement, plane?: ExercisePlane, sort?: ExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseVariants, exerciseVariantsMeta } = await this.action('exerciseVariant:list', options) as ExerciseVariantListResponse
    return new PrivilegedExerciseVariants(exerciseVariants, exerciseVariantsMeta, this.sessionHandler)
  }

  async createExerciseVariant (params: { exerciseId: number, variant: ExerciseVariantType, laterality: ExerciseLaterality, movement: ExerciseMovement, plane: ExercisePlane }) {
    const { exerciseVariant } = await this.action('exerciseVariant:create', params) as ExerciseVariantResponse
    return new PrivilegedExerciseVariant(exerciseVariant, this.sessionHandler)
  }

  async getStretchExercise (params: {id: number}) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new PrivilegedStretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async createStretchExercise (params: { exerciseVariantId: number, imageUri?: string, instructionalVideoUri?: string }) {
    const { stretchExercise } = await this.action('stretchExercise:create', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getCardioExercise (params: {id: number}) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new PrivilegedCardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async createCardioExercise (params: { exerciseVariantId: number, cardioMachineId: number, imageUri?: string, instructionalVideoUri?: string }) {
    const { cardioExercise } = await this.action('cardioExercise:create', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getMuscle (params: {id: number}) {
    const { muscle } = await this.action('muscle:show', params) as MuscleResponse
    return new PrivilegedMuscle(muscle, this.sessionHandler)
  }

  async getMuscles (options: {name?: string, group?: MuscleGroup, part?: MuscleBodyPart, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { muscles, musclesMeta } = await this.action('muscle:list', options) as MuscleListResponse
    return new PrivilegedMuscles(muscles, musclesMeta, this.sessionHandler)
  }

  async createMuscle (params: { name: string, group: MuscleGroup, part: MuscleBodyPart }) {
    const { muscle } = await this.action('muscle:create', params) as MuscleResponse
    return new PrivilegedMuscle(muscle, this.sessionHandler)
  }

  async getStrengthMachine (params: {id: number}) {
    const { strengthMachine } = await this.action('strengthMachine:show', params) as StrengthMachineResponse
    return new PrivilegedStrengthMachine(strengthMachine, this.sessionHandler)
  }

  async getStrengthMachines (options: {name?: string, line?: StrengthMachineLine, variant?: string, sort?: StrengthMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { strengthMachines, strengthMachinesMeta } = await this.action('strengthMachine:list', options) as StrengthMachineListResponse
    return new PrivilegedStrengthMachines(strengthMachines, strengthMachinesMeta, this.sessionHandler)
  }

  async createStrengthMachine (params: { name: string, line: StrengthMachineLine, variant?: string, exerciseId?: number }) {
    const { strengthMachine } = await this.action('strengthMachine:create', params) as StrengthMachineResponse
    return new PrivilegedStrengthMachine(strengthMachine, this.sessionHandler)
  }

  async getCardioMachine (params: {id: number}) {
    const { cardioMachine } = await this.action('cardioMachine:show', params) as CardioMachineResponse
    return new PrivilegedCardioMachine(cardioMachine, this.sessionHandler)
  }

  async getCardioMachines (options: {name?: string, sort?: CardioMachineSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { cardioMachines, cardioMachinesMeta } = await this.action('cardioMachine:list', options) as CardioMachineListResponse
    return new PrivilegedCardioMachines(cardioMachines, cardioMachinesMeta, this.sessionHandler)
  }

  async createCardioMachine (params: { name: string, line: CardioMachineLine, parseCode: CardioMachineParseCode, exerciseId?: number }) {
    const { cardioMachine } = await this.action('cardioMachine:create', params) as CardioMachineResponse
    return new PrivilegedCardioMachine(cardioMachine, this.sessionHandler)
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
