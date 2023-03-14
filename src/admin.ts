import { MetricsConnection } from './connection'
import Metrics from './core'
import { ClientSideActionPrevented } from './error'
import { DecodeJWT } from './lib/jwt'
import { Cache, CacheKeysResponse, CacheObjectResponse } from './models/cache'
import { CardioExerciseListResponse, CardioExerciseResponse, CardioExerciseSorting, PrivilegedCardioExercise, PrivilegedCardioExercises } from './models/cardioExercise'
import { CardioExerciseMuscleResponse, PrivilegedCardioExerciseMuscle } from './models/cardioExerciseMuscle'
import { CardioExerciseVariantResponse, PrivilegedCardioExerciseVariant } from './models/cardioExerciseVariant'
import { ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, ExerciseAliasType, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './models/exerciseAlias'
import { ExerciseOrdinalSetListResponse, ExerciseOrdinalSetResponse, ExerciseOrdinalSetSorting, PrivilegedExerciseOrdinalSet, PrivilegedExerciseOrdinalSets } from './models/exerciseOrdinalSet'
import { ExerciseOrdinalSetAssignmentResponse, PrivilegedExerciseOrdinalSetAssignment } from './models/exerciseOrdinalSetAssignment'
import { FacilityLicense, FacilityLicenseListResponse, FacilityLicenseResponse, FacilityLicenses, FacilityLicenseSorting, LicenseType } from './models/facilityLicense'
import { AnalyticPermission, ExercisePermission, GlobalAccessControl, GlobalAccessControlCreationResponse, GlobalAccessControlData, GlobalAccessControlListResponse, GlobalAccessControlResponse, GlobalAccessControls, GlobalAccessControlSorting, MSeriesGuidedSessionPermission, Permission } from './models/globalAccessControl'
import { StatListResponse, Stats, StatSorting } from './models/stat'
import { PrivilegedStrengthExercise, PrivilegedStrengthExercises, StrengthExerciseCategory, StrengthExerciseListResponse, StrengthExerciseMovement, StrengthExerciseMovementDEP, StrengthExercisePlane, StrengthExerciseResponse, StrengthExerciseSorting } from './models/strengthExercise'
import { PrivilegedStrengthExerciseMuscle, StrengthExerciseMuscleResponse } from './models/strengthExerciseMuscle'
import { PrivilegedStrengthExerciseVariant, StrengthExerciseVariantResponse } from './models/strengthExerciseVariant'
import { PrivilegedStretchExercise, PrivilegedStretchExercises, StretchExerciseListResponse, StretchExerciseResponse, StretchExerciseSorting } from './models/stretchExercise'
import { PrivilegedStretchExerciseMuscle, StretchExerciseMuscleResponse } from './models/stretchExerciseMuscle'
import { PrivilegedStretchExerciseVariant, StretchExerciseVariantResponse } from './models/stretchExerciseVariant'
import { FailedTasks, Queue, ResqueDetailsResponse, TaskFailedResponse, TaskQueueResponse, Tasks, WorkersResponse } from './models/task'
import { User, UserListResponse, UserResponse, Users, UserSorting } from './models/user'
import { AccessToken, UserSession } from './session'

export default class MetricsAdmin extends Metrics {
  /** @deprecated */
  async authenticateAdminWithCredentials (params: { email: string, password: string, token: string, refreshable?: boolean }) {
    const response = await this._connection.action('admin:login', { refreshable: true, ...params }) as UserResponse
    const accessToken = DecodeJWT(response.accessToken) as AccessToken
    if (typeof accessToken.globalAccessControl === 'undefined' || accessToken.globalAccessControl === null) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for admin session.' })
    }
    return new AdminSession(response, this._connection, accessToken.globalAccessControl)
  }

  async authenticateAdminWithToken (params: { token: string }) {
    const response = await this._connection.action('user:show', { authorization: params.token }) as UserResponse
    const accessToken = DecodeJWT(response.accessToken) as AccessToken
    if (typeof accessToken.globalAccessControl === 'undefined' || accessToken.globalAccessControl === null) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for admin session.' })
    }
    return new AdminSession(response, this._connection, accessToken.globalAccessControl)
  }

  async authenticateAdminWithExchangeToken (params: { exchangeToken: string }) {
    const response = await this._connection.action('auth:exchangeFulfillment', params) as UserResponse
    const accessToken = DecodeJWT(response.accessToken) as AccessToken
    if (typeof accessToken.globalAccessControl === 'undefined' || accessToken.globalAccessControl === null) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for admin session.' })
    }
    return new AdminSession(response, this._connection, accessToken.globalAccessControl)
  }
}

export class AdminSession extends UserSession {
  private readonly _globalAccessControl: GlobalAccessControl

  constructor (loginResponse: UserResponse, connection: MetricsConnection, globalAccessControlData: GlobalAccessControlData) {
    super(loginResponse, connection)
    this._globalAccessControl = new GlobalAccessControl(globalAccessControlData, this.sessionHandler)
  }

  get globalAccessControl () {
    return this._globalAccessControl
  }

  async getStats (options: { from?: Date, to?: Date, sort?: StatSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { stats, statsMeta } = await this.action('stats:list', options) as StatListResponse
    return new Stats(stats, statsMeta, this.sessionHandler)
  }

  async getUser (params: { userId: number }) {
    const { user } = await this.action('user:show', params) as UserResponse
    return new User(user, this.sessionHandler)
  }

  async getUsers (options: { name?: string, email?: string, sort?: UserSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { users, usersMeta } = await this.action('user:list', options) as UserListResponse
    return new Users(users, usersMeta, this.sessionHandler)
  }

  async mergeUsers (params: { fromUserId: number, toUserId: number }) {
    const { user } = await this.action('user:merge', params) as UserResponse
    return new User(user, this.sessionHandler)
  }

  async getCacheKeys (options: { filter?: string } = { }) {
    const { cacheKeys } = await this.action('resque:cache:list') as CacheKeysResponse
    return cacheKeys.filter(key => key.startsWith('cache:' + (options?.filter ?? ''))).map(key => new Cache(key.replace(/$cache:/, ''), this.sessionHandler))
  }

  async getCacheKey (key: string) {
    const { cacheObject } = await this.action('resque:cache:show', { key }) as CacheObjectResponse
    return new Cache(cacheObject.key, this.sessionHandler)
  }

  async createCacheKey (params: { key: string, value: string, expireIn?: number }) {
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

  async getTasks (options: { queue: Queue, offset?: number, limit?: number }) {
    const { tasks, tasksMeta } = await this.action('resque:task:queue', options) as TaskQueueResponse
    return new Tasks(tasks, tasksMeta, this.sessionHandler)
  }

  async getFailedTasks (options: { offset?: number, limit?: number } = { }) {
    const { tasks, tasksMeta } = await this.action('resque:task:failures', options) as TaskFailedResponse
    return new FailedTasks(tasks, tasksMeta, this.sessionHandler)
  }

  async retryAllFailedTasks () {
    await this.action('resque:task:retryAllFailed')
  }

  async deleteAllFailedTasks () {
    await this.action('resque:task:deleteAllFailed')
  }

  async getExerciseAlias (params: { id: number }) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: { alias?: string, type?: ExerciseAliasType, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async getExerciseOrdinalSetAssignment (params: { id: number }) {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:show', params) as ExerciseOrdinalSetAssignmentResponse
    return new PrivilegedExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)
  }

  async getExerciseOrdinalSet (params: { id: number }) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:show', params) as ExerciseOrdinalSetResponse
    return new PrivilegedExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getExerciseOrdinalSets (options: { code?: string, name?: string, sort?: ExerciseOrdinalSetSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseOrdinalSets, exerciseOrdinalSetsMeta } = await this.action('exerciseOrdinalSet:list', options) as ExerciseOrdinalSetListResponse
    return new PrivilegedExerciseOrdinalSets(exerciseOrdinalSets, exerciseOrdinalSetsMeta, this.sessionHandler)
  }

  async createExerciseOrdinalSet (params: { code: string, name: string, description: string }) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:create', params) as ExerciseOrdinalSetResponse
    return new PrivilegedExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getStrengthExercise (params: { id: number }) {
    const { strengthExercise } = await this.action('strengthExercise:show', params) as StrengthExerciseResponse
    return new PrivilegedStrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExercises (options: { defaultAlias?: string, category?: StrengthExerciseCategory, movement?: StrengthExerciseMovementDEP, plane?: StrengthExercisePlane, sort?: StrengthExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExercises, strengthExercisesMeta } = await this.action('strengthExercise:list', options) as StrengthExerciseListResponse
    return new PrivilegedStrengthExercises(strengthExercises, strengthExercisesMeta, this.sessionHandler)
  }

  async createStrengthExercise (params: { defaultExerciseAlias: string, category: StrengthExerciseCategory, movement: StrengthExerciseMovementDEP, plane: StrengthExercisePlane, humanMovement: StrengthExerciseMovement }) {
    const { strengthExercise } = await this.action('strengthExercise:create', params) as StrengthExerciseResponse
    return new PrivilegedStrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExerciseVariant (params: { id: number }) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:show', { ...params }) as StrengthExerciseVariantResponse
    return new PrivilegedStrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)
  }

  async getStrengthExerciseMuscle (params: { id: number }) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { ...params }) as StrengthExerciseMuscleResponse
    return new PrivilegedStrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)
  }

  async getStretchExercise (params: { id: number }) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { defaultAlias?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new PrivilegedStretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async createStretchExercise (params: { defaultExerciseAlias: string }) {
    const { stretchExercise } = await this.action('stretchExercise:create', params) as StretchExerciseResponse
    return new PrivilegedStretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExerciseVariant (params: { id: number }) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:show', { ...params }) as StretchExerciseVariantResponse
    return new PrivilegedStretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)
  }

  async getStretchExerciseMuscle (params: { id: number }) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { ...params }) as StretchExerciseMuscleResponse
    return new PrivilegedStretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)
  }

  async getCardioExercise (params: { id: number }) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: { defaultAlias?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new PrivilegedCardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async createCardioExercise (params: { defaultExerciseAlias: string }) {
    const { cardioExercise } = await this.action('cardioExercise:create', params) as CardioExerciseResponse
    return new PrivilegedCardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExerciseVariant (params: { id: number }) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:show', { ...params }) as CardioExerciseVariantResponse
    return new PrivilegedCardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)
  }

  async getCardioExerciseMuscle (params: { id: number }) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { ...params }) as CardioExerciseMuscleResponse
    return new PrivilegedCardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getFacilityLicense (params: { id: number }) {
    const { facilityLicense } = await this.action('facilityLicense:show', params) as FacilityLicenseResponse
    return new FacilityLicense(facilityLicense, this.sessionHandler)
  }

  async getFacilityLicenses (options: { name?: string, key?: string, type?: LicenseType, accountId?: string, sort?: FacilityLicenseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityLicenses, facilityLicensesMeta } = await this.action('facilityLicense:list', options) as FacilityLicenseListResponse
    return new FacilityLicenses(facilityLicenses, facilityLicensesMeta, this.sessionHandler)
  }

  async createFacilityLicense (params: { accountId?: string, term: number, type: LicenseType, name?: string, email?: string }) {
    const { facilityLicense } = await this.action('facilityLicense:create', params) as FacilityLicenseResponse
    return new FacilityLicense(facilityLicense, this.sessionHandler)
  }

  async getGlobalAccessControl (params: { userId: number}) {
    const { globalAccessControl } = await this.action('globalAccessControl:show', params) as GlobalAccessControlResponse
    return new GlobalAccessControl(globalAccessControl, this.sessionHandler)
  }

  async getGlobalAccessControls (options: { name?: string, sort?: GlobalAccessControlSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { globalAccessControls, globalAccessControlsMeta } = await this.action('globalAccessControl:list', options) as GlobalAccessControlListResponse
    return new GlobalAccessControls(globalAccessControls, globalAccessControlsMeta, this.sessionHandler)
  }

  async createGlobalAccessControl (params: {userId: number, userRights?: Permission, exerciseRights?: ExercisePermission, mSeriesGuidedSessionRights?: MSeriesGuidedSessionPermission, facilityRights?: Permission, licenseRights?: Permission, accessControlRights?: Permission, resqueRights?: Permission, analyticRights?: AnalyticPermission }) {
    const { globalAccessControl, globalAccessControlSecret } = await this.action('globalAccessControl:create', params) as GlobalAccessControlCreationResponse
    return {
      globalAccessControl: new GlobalAccessControl(globalAccessControl, this.sessionHandler),
      globalAccessControlSecret
    }
  }
}
