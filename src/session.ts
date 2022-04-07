import { ConnectionEvent, MetricsConnection, PushDataEvent } from './connection'
import { DEFAULT_REQUEST_TIMEOUT, JWT_TTL_LIMIT } from './constants'
import { SessionError } from './error'
import { EventDispatcher } from './lib/event'
import { DecodeJWT } from './lib/jwt'
import { A500MachineState, A500MachineStateResponse } from './models/a500MachineState'
import { CardioExercise, CardioExerciseListResponse, CardioExerciseResponse, CardioExercises, CardioExerciseSorting } from './models/cardioExercise'
import { CardioExerciseMuscle, CardioExerciseMuscleResponse } from './models/cardioExerciseMuscle'
import { CardioExerciseVariant, CardioExerciseVariantResponse } from './models/cardioExerciseVariant'
import { CardioMachine, CardioMachineListResponse, CardioMachineResponse, CardioMachines, CardioMachineSorting } from './models/cardioMachine'
import { ExerciseAlias, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, ExerciseAliasType } from './models/exerciseAlias'
import { ExerciseOrdinalSet, ExerciseOrdinalSetListResponse, ExerciseOrdinalSetResponse, ExerciseOrdinalSets, ExerciseOrdinalSetSorting } from './models/exerciseOrdinalSet'
import { ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentResponse } from './models/exerciseOrdinalSetAssignment'
import { Facilities, Facility, FacilityData, FacilityListResponse, FacilityResponse, FacilitySorting, PrivilegedFacility } from './models/facility'
import { FacilityAccessControl, FacilityAccessControlResponse } from './models/facilityAccessControl'
import { FacilityConfiguration, FacilityConfigurationResponse } from './models/facilityConfiguration'
import { KioskSessionResponse } from './models/facilityKiosk'
import { FacilityRelationshipResponse, FacilityUserMemberRelationship, FacilityUserMemberRelationships, FacilityUserRelationship, FacilityUserRelationshipListResponse, FacilityUserRelationships, FacilityUserRelationshipSorting, UserFacilityRelationship } from './models/facilityRelationship'
import { FacilityStrengthMachine, FacilityStrengthMachineData } from './models/facilityStrengthMachine'
import { FacilityStrengthMachineConfiguration, FacilityStrengthMachineConfigurationResponse } from './models/facilityStrengthMachineConfiguration'
import { GlobalAccessControlData } from './models/globalAccessControl'
import { Session } from './models/session'
import { StrengthExercise, StrengthExerciseCategory, StrengthExerciseListResponse, StrengthExerciseMovement, StrengthExercisePlane, StrengthExerciseResponse, StrengthExercises, StrengthExerciseSorting } from './models/strengthExercise'
import { StrengthExerciseMuscle, StrengthExerciseMuscleResponse } from './models/strengthExerciseMuscle'
import { StrengthExerciseVariant, StrengthExerciseVariantResponse } from './models/strengthExerciseVariant'
import { StrengthMachine, StrengthMachineIdentifier, StrengthMachineListResponse, StrengthMachineResponse, StrengthMachines, StrengthMachineSorting } from './models/strengthMachine'
import { StretchExercise, StretchExerciseListResponse, StretchExerciseResponse, StretchExercises, StretchExerciseSorting } from './models/stretchExercise'
import { StretchExerciseMuscle, StretchExerciseMuscleResponse } from './models/stretchExerciseMuscle'
import { StretchExerciseVariant, StretchExerciseVariantResponse } from './models/stretchExerciseVariant'
import { FacilityMemberUser, FacilityUserResponse, OAuthUserResponse, User, UserResponse } from './models/user'

/** @ignore */
const MODEL_UPDATE_ROOM_REGEX = /^sub:/
export interface AuthenticatedResponse {
  accessToken: string
  refreshToken?: string
}

export interface FacilityKioskTokenResponse extends AuthenticatedResponse {
  kioskToken: string
}

export interface OAuthTokenResponse extends UserResponse {
  expiresIn: string
}

export interface StrengthMachineInitializeResponse extends AuthenticatedResponse {
  facilityStrengthMachine: FacilityStrengthMachineData
}

export interface SubscriptionResponse extends AuthenticatedResponse {
  subscriptionKey: string
}

export interface RedirectResponse {
  url: string
}

export interface CheckReturnRouteResponse {
  valid: boolean
}

export interface AuthPrefillParams {
  email: string
  returnUrl: string
  requiresElevated?: boolean
  name?: string
  birthday?: string
  gender?: string
  language?: string
  units?: string
  metricWeight?: number
  bodyFatPercentage?: number
  metricHeight?: number
}

export interface AccessTokenChangeEvent {
  accessToken: string
}

export interface RefreshTokenChangeEvent {
  refreshToken: string
}

export interface KioskTokenChangeEvent {
  kioskToken: string
}

export interface StrengthMachineTokenChangeEvent {
  accessToken: string
}

export interface JWTToken {
  iss: string
  jti: string
  exp: number
  type: 'access' | 'refresh' | 'kiosk' | 'machine'
}

export interface SessionToken extends JWTToken {
  user: { id: number }
  facility?: FacilityData | null
  facilityRole?: string | null
  globalAccessControl?: GlobalAccessControlData | null
  exp: number
}

export interface AccessToken extends SessionToken {
  type: 'access'
}

export interface RefreshToken extends SessionToken {
  type: 'refresh'
}

export interface OAuthToken extends SessionToken {
  userApplicationAuthorization: { id: number }
}

export interface KioskToken extends JWTToken {
  facility: FacilityData
  type: 'kiosk'
  exp: number
}

export interface StrengthMachineToken extends JWTToken{
  facility: {
    id: number
  }
  facilityRole: string
  facilityStrengthMachineId: number
  type: 'machine'
}

export interface ModelChangeEvent {
  id: number
  name: string
  mutation: 'create' | 'update' | 'delete'
  occurredAt: number
}

interface ModelChangeEventHandler {
  onChangeCallbacks: Set<(modelChangeEvent: ModelChangeEvent) => void>
  onReconnectCallback: () => Promise<SubscriptionResponse>
}

export interface ModelSubscribeParameters {
  model: string
  id: number
  userId?: number
  facilityRelationshipId?: number
  actionOverride?: string
}

export interface ListSubscribeParameters {
  parentModel: string
  parentId: number
  model: string
  actionOverride?: string
}

export abstract class BaseSessionHandler {
  protected readonly _connection: MetricsConnection
  private _keepAlive: boolean = true
  private _accessToken: string = ''
  private _refreshToken: string | null = null
  private _accessTokenTimeout: ReturnType<typeof setTimeout> | null = null
  private readonly _modelChangeEventHandlerMap = new Map<string, ModelChangeEventHandler>()
  private readonly _onAccessTokenChangeEvent = new EventDispatcher<AccessTokenChangeEvent>()
  private readonly _onRefreshTokenChangeEvent = new EventDispatcher<RefreshTokenChangeEvent>()

  constructor (connection: MetricsConnection, authenticatedResponse: AuthenticatedResponse, keepAlive: boolean = true) {
    this._connection = connection
    this._keepAlive = keepAlive
    this._connection.onDisposeEvent.one(() => this.close())
    this._connection.onConnectionChangeEvent.subscribe(connectionEvent => this.handleConnectionEvent(connectionEvent))
    this._connection.onPushDataEvent.subscribe(data => this.dispatchPushData(data))
    this.updateTokens(authenticatedResponse)
  }

  private updateTokens (response: AuthenticatedResponse) {
    this._accessToken = response.accessToken
    this._onAccessTokenChangeEvent.dispatchAsync({ accessToken: this._accessToken })

    if (this._accessTokenTimeout !== null) {
      clearTimeout(this._accessTokenTimeout)
    }

    if (this._keepAlive) {
      const tokenTTL = this.decodedAccessToken.exp * 1000 - Date.now() - JWT_TTL_LIMIT
      this._accessTokenTimeout = setTimeout(() => { void this.keepAccessTokenAlive() }, tokenTTL)
    }

    if (typeof response.refreshToken !== 'undefined') {
      this._refreshToken = response.refreshToken
      this._onRefreshTokenChangeEvent.dispatchAsync({ refreshToken: this._refreshToken })
    }
  }

  private async keepAccessTokenAlive () {
    if (this._keepAlive) {
      try {
        await this.action('auth:keepAlive')
      } catch (error) {

      }
    }
  }

  private handleConnectionEvent (connectionEvent: ConnectionEvent) {
    if (connectionEvent.socketConnection) {
      this._modelChangeEventHandlerMap.forEach(e => void e.onReconnectCallback())
    }
  }

  private dispatchPushData (pushData: PushDataEvent) {
    if (MODEL_UPDATE_ROOM_REGEX.test(pushData.room)) {
      const modelChangeEventHandler = this._modelChangeEventHandlerMap.get(pushData.room)
      if (typeof modelChangeEventHandler !== 'undefined') {
        modelChangeEventHandler.onChangeCallbacks.forEach(e => e(pushData.message))
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
    if (!this._keepAlive && this._accessTokenTimeout !== null) {
      clearTimeout(this._accessTokenTimeout)
    }
  }

  abstract get decodedAccessToken (): any

  get accessToken () {
    return this._accessToken
  }

  get refreshToken () {
    return this._refreshToken
  }

  get decodedRefreshToken () {
    return this._refreshToken !== null ? DecodeJWT(this._refreshToken) as RefreshToken : null
  }

  get onRefreshTokenChangeEvent () {
    return this._onRefreshTokenChangeEvent.asEvent()
  }

  get onAccessTokenChangeEvent () {
    return this._onAccessTokenChangeEvent.asEvent()
  }

  close () {
    if (this._accessTokenTimeout !== null) {
      clearTimeout(this._accessTokenTimeout)
    }
    this.keepAlive = false
    this._accessToken = ''
    this._refreshToken = null
  }

  abstract logout (): void

  async action (action: string, params: Object = { }) {
    let response
    if (this._keepAlive && this._accessTokenTimeout !== null && this.decodedAccessToken.exp * 1000 - Date.now() <= JWT_TTL_LIMIT + DEFAULT_REQUEST_TIMEOUT) {
      clearTimeout(this._accessTokenTimeout)
    }
    try {
      const authParams = { authorization: this._accessToken, ...params }
      response = await this._connection.action(action, authParams) as AuthenticatedResponse
    } catch (error) {
      if (error instanceof SessionError && this._refreshToken !== null && (DecodeJWT(this._refreshToken) as RefreshToken).exp * 1000 - Date.now() > 0) {
        const authParams = { authorization: this._refreshToken, ...params }
        response = await this._connection.action(action, authParams) as AuthenticatedResponse
      } else {
        throw error
      }
    }
    this.updateTokens(response)
    return response
  }

  async subscribeToModel (subscribeParameters: ModelSubscribeParameters, callback: (modelChangeEvent: ModelChangeEvent) => void) {
    const subscriptionKey = `sub:${subscribeParameters.model}:${subscribeParameters.id}`
    const subscribe = async () => await this.action(subscribeParameters.actionOverride ?? `${subscribeParameters.model}:subscribe`, { id: subscribeParameters.id, userId: subscribeParameters.userId, facilityRelationshipId: subscribeParameters.facilityRelationshipId }) as SubscriptionResponse
    return await this.subscribe(subscriptionKey, subscribe, callback)
  }

  async subscribeToModelList (subscribeParameters: ListSubscribeParameters, callback: (modelChangeEvent: ModelChangeEvent) => void) {
    const subscriptionKey = `sub:${subscribeParameters.parentModel}:${subscribeParameters.parentId}:${subscribeParameters.model}`
    let params = {}
    switch (subscribeParameters.parentModel) {
      case 'user':
        params = { userId: subscribeParameters.parentId }
        break
      case 'facility':
        params = { facilityId: subscribeParameters.parentId }
        break
    }
    const subscribe = async () => await this.action(subscribeParameters.actionOverride ?? `${subscribeParameters.model}:subscribe`, params) as SubscriptionResponse
    return await this.subscribe(subscriptionKey, subscribe, callback)
  }

  private async subscribe (subscriptionKey: NamedCurve, subscribe: () => Promise<SubscriptionResponse>, callback: (modelChangeEvent: ModelChangeEvent) => void) {
    const modelChangeEventHandler = this._modelChangeEventHandlerMap.get(subscriptionKey)
    if (typeof modelChangeEventHandler !== 'undefined') {
      if (!modelChangeEventHandler.onChangeCallbacks.has(callback)) {
        modelChangeEventHandler.onChangeCallbacks.add(callback)
      }
    } else {
      this._modelChangeEventHandlerMap.set(subscriptionKey, {
        onChangeCallbacks: new Set([callback]),
        onReconnectCallback: subscribe
      })
      try {
        await subscribe()
      } catch (e) {}
    }

    return async () => {
      const modelChangeEventHandler = this._modelChangeEventHandlerMap.get(subscriptionKey)
      if (typeof modelChangeEventHandler !== 'undefined') {
        modelChangeEventHandler.onChangeCallbacks.delete(callback)

        if (modelChangeEventHandler.onChangeCallbacks.size === 0) {
          this._modelChangeEventHandlerMap.delete(subscriptionKey)
          try {
            await this.action('core:unsubscribe', { subscriptionKey })
          } catch (error) {}
        }
      }
    }
  }
}

export class UserSessionHandler extends BaseSessionHandler {
  private _userId: number | null = null

  constructor (connection: MetricsConnection, userResponse: UserResponse) {
    super(connection, userResponse, true)
  }

  get decodedAccessToken () {
    return DecodeJWT(this.accessToken) as AccessToken
  }

  get userId () {
    return this._userId ?? (this._userId = this.decodedAccessToken.user.id)
  }

  async logout () {
    const authParams = { authorization: this.refreshToken ?? this.accessToken }
    await this._connection.action('auth:logout', authParams)
    this.close()
  }
}

export class OAuthSessionHandler extends BaseSessionHandler {
  private readonly _oauthTokenResponse: OAuthTokenResponse

  constructor (connection: MetricsConnection, oauthTokenResponse: OAuthTokenResponse) {
    super(connection, oauthTokenResponse, false)

    this._oauthTokenResponse = oauthTokenResponse
  }

  get decodedAccessToken (): any {
    return DecodeJWT(this.accessToken) as OAuthToken
  }

  get expiresIn () {
    return this._oauthTokenResponse.expiresIn
  }

  async logout () {
    const authParams = { authorization: this.refreshToken ?? this.accessToken }
    await this._connection.action('auth:logout', authParams)
    this.close()
  }
}

export class KioskSessionHandler extends BaseSessionHandler {
  constructor (connection: MetricsConnection, { accessToken }: { accessToken: string }) {
    super(connection, { accessToken }, false)
  }

  get decodedAccessToken () {
    return DecodeJWT(this.accessToken) as KioskToken
  }

  async action (action: string, params: Object = { }) {
    const authParams = { authorization: this.accessToken, ...params }
    return await this.connection.action(action, authParams) as any
  }

  async logout () {
    await this.action('facilityKioskToken:delete')
    this.close()
  }
}

export class KioskSession {
  private readonly _facilityId: number
  private readonly _sessionHandler: KioskSessionHandler

  constructor ({ accessToken }: { accessToken: string }, connection: MetricsConnection) {
    this._sessionHandler = new KioskSessionHandler(connection, { accessToken })
    this._facilityId = this._sessionHandler.decodedAccessToken.facility.id
  }

  get sessionHandler () {
    return this._sessionHandler
  }

  get kioskToken () {
    return this._sessionHandler.accessToken
  }

  get facilityId () {
    return this._facilityId
  }

  close () {
    this._sessionHandler.close()
  }

  async logout () {
    await this._sessionHandler.logout()
  }

  private async action (action: string, params: Object = { }) {
    return await this.sessionHandler.action(action, params)
  }

  async userLogin (params: { primaryIdentification: string | number, secondaryIdentification?: string | number }) {
    const response = await this.action('facilityKiosk:userLogin', params) as FacilityUserResponse
    return new FacilityUserSession(response, this.sessionHandler.connection)
  }

  async fingerprintLogin (params: { facilityRelationshipId: number, hash: string }) {
    const response = await this.action('facilityKiosk:fingerprintLogin', params) as FacilityUserResponse
    return new FacilityUserSession(response, this.sessionHandler.connection)
  }

  async sessionUpdate (params: { echipId: string, echipData: object }) {
    const { session } = await this.action('facilityKiosk:sessionUpdateEchip', { echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as KioskSessionResponse
    return new Session(session, this.sessionHandler)
  }

  async sessionEnd (params: { echipId: string, echipData: object }) {
    const { session } = await this.action('facilityKiosk:sessionEndEchip', { echipId: params.echipId, echipData: JSON.stringify(params.echipData) }) as KioskSessionResponse
    return new Session(session, this.sessionHandler)
  }

  async getFacility () {
    const { facility } = await this.action('facility:show') as FacilityResponse
    return new Facility(facility, this.sessionHandler)
  }

  async getAccessControl () {
    const { facilityAccessControl } = await this.action('facilityAccessControl:show') as FacilityAccessControlResponse
    return new FacilityAccessControl(facilityAccessControl, this.sessionHandler)
  }

  async getConfiguration () {
    const { facilityConfiguration } = await this.action('facilityConfiguration:show') as FacilityConfigurationResponse
    return new FacilityConfiguration(facilityConfiguration, this.sessionHandler)
  }

  async getRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { ...params }) as FacilityRelationshipResponse
    return new FacilityUserRelationship(facilityRelationship, this.sessionHandler)
  }

  async getRelationships (options: { name?: string, member?: boolean, employee?: boolean, memberIdentifier?: string, includeSession?: boolean, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getMemberRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { ...params }) as FacilityRelationshipResponse
    return new FacilityUserMemberRelationship(facilityRelationship, this.sessionHandler)
  }

  async getMemberRelationships (options: { name?: string, memberIdentifier?: string, includeSession?: boolean, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserMemberRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }
}

export class StrengthMachineSessionHandler extends BaseSessionHandler {
  constructor (connection: MetricsConnection, authenticatedResponse: AuthenticatedResponse) {
    super(connection, authenticatedResponse, false)
  }

  get decodedAccessToken () {
    return DecodeJWT(this.accessToken) as StrengthMachineToken
  }

  async action (action: string, params: Object = { }) {
    const authParams = { authorization: this.accessToken, ...params }
    return await this.connection.action(action, authParams) as any
  }

  async logout () {
    this.close()
  }
}

export class StrengthMachineSession {
  private readonly _facilityId: number
  private readonly _sessionHandler: StrengthMachineSessionHandler
  protected _facilityStrengthMachineData: FacilityStrengthMachineData

  constructor ({ accessToken, facilityStrengthMachine }: { accessToken: string, facilityStrengthMachine: FacilityStrengthMachineData }, connection: MetricsConnection) {
    this._sessionHandler = new StrengthMachineSessionHandler(connection, { accessToken })
    this._facilityId = this._sessionHandler.decodedAccessToken.facility.id
    this._facilityStrengthMachineData = facilityStrengthMachine
  }

  get sessionHandler () {
    return this._sessionHandler
  }

  get accessToken () {
    return this._sessionHandler.accessToken
  }

  get onAccessTokenChangeEvent () {
    return this._sessionHandler.onAccessTokenChangeEvent
  }

  get facilityId () {
    return this._facilityId
  }

  close () {
    this._sessionHandler.close()
  }

  private async action (action: string, params: Object = { }) {
    return await this.sessionHandler.action(action, params)
  }

  eagerFacilityStrengthMachine () {
    return new FacilityStrengthMachine(this._facilityStrengthMachineData, this.sessionHandler)
  }

  async userLogin (params: { memberIdentifier: string | number }) {
    const response = await this.action('a500:userLogin', params) as FacilityUserResponse
    return new FacilityUserSession(response, this.sessionHandler.connection)
  }

  async updateMachineIdentifier (params: { strengthMachineIdentifier: StrengthMachineIdentifier }) {
    const response = await this.action('a500:initialize', { ...params.strengthMachineIdentifier }) as StrengthMachineInitializeResponse
    this._facilityStrengthMachineData = response.facilityStrengthMachine
    return this
  }

  async createA500UtilizationInstance (params: { takenAt: Date, repetitionCount: number }) {
    await this.action('a500:createUtilizationInstance', params)
  }

  async getFacility () {
    const { facility } = await this.action('facility:show') as FacilityResponse
    return new Facility(facility, this.sessionHandler)
  }

  async getA500MachineState () {
    const response = await this.action('a500:showMachineState') as A500MachineStateResponse
    return new A500MachineState(response.a500MachineState, this.sessionHandler)
  }

  async getFacilityConfiguration () {
    const { facilityConfiguration } = await this.action('facilityConfiguration:show') as FacilityConfigurationResponse
    return new FacilityConfiguration(facilityConfiguration, this.sessionHandler)
  }

  async getFacilityStrengthMachineConfiguration () {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:show') as FacilityStrengthMachineConfigurationResponse
    return new FacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration, this.sessionHandler)
  }
}

export abstract class UserSessionBase<UserType extends User = User> {
  protected _sessionHandler: SessionHandler
  protected abstract readonly _user: UserType

  constructor (userResponse: UserResponse, connection: MetricsConnection) {
    this._sessionHandler = new UserSessionHandler(connection, userResponse)
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

  get accessToken () {
    return this._sessionHandler.accessToken
  }

  get onAccessTokenChangeEvent () {
    return this._sessionHandler.onAccessTokenChangeEvent
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

  eagerActiveFacility () {
    return this._sessionHandler instanceof UserSessionHandler && typeof this._sessionHandler.decodedAccessToken.facility !== 'undefined' && this._sessionHandler.decodedAccessToken.facility !== null ? new PrivilegedFacility(this._sessionHandler.decodedAccessToken.facility, this._sessionHandler) : undefined
  }

  protected async action (action: string, params: Object = { }) {
    return await this.sessionHandler.action(action, params)
  }

  async getExerciseAlias (params: { id: number }) {
    const { exerciseAlias } = await this.action('exerciseAlias:show', params) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getExerciseAliases (options: { alias?: string, type?: ExerciseAliasType, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', options) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async getExerciseOrdinalSetAssignment (params: { id: number }) {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:show', params) as ExerciseOrdinalSetAssignmentResponse
    return new ExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)
  }

  async getExerciseOrdinalSet (params: { id: number }) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:show', params) as ExerciseOrdinalSetResponse
    return new ExerciseOrdinalSet(exerciseOrdinalSet, this.sessionHandler)
  }

  async getExerciseOrdinalSets (options: { code?: string, name?: string, sort?: ExerciseOrdinalSetSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseOrdinalSets, exerciseOrdinalSetsMeta } = await this.action('exerciseOrdinalSet:list', options) as ExerciseOrdinalSetListResponse
    return new ExerciseOrdinalSets(exerciseOrdinalSets, exerciseOrdinalSetsMeta, this.sessionHandler)
  }

  async getStrengthExercise (params: { id: number }) {
    const { strengthExercise } = await this.action('strengthExercise:show', params) as StrengthExerciseResponse
    return new StrengthExercise(strengthExercise, this.sessionHandler)
  }

  async getStrengthExercises (options: { defaultAlias?: string, category?: StrengthExerciseCategory, movement?: StrengthExerciseMovement, plane?: StrengthExercisePlane, sort?: StrengthExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExercises, strengthExercisesMeta } = await this.action('strengthExercise:list', options) as StrengthExerciseListResponse
    return new StrengthExercises(strengthExercises, strengthExercisesMeta, this.sessionHandler)
  }

  async getStrengthMachine (params: { id: number }) {
    const { strengthMachine } = await this.action('strengthMachine:show', params) as StrengthMachineResponse
    return new StrengthMachine(strengthMachine, this.sessionHandler)
  }

  async getStrengthMachines (options: { name?: string, line?: string, variant?: string, sort?: StrengthMachineSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthMachines, strengthMachinesMeta } = await this.action('strengthMachine:list', options) as StrengthMachineListResponse
    return new StrengthMachines(strengthMachines, strengthMachinesMeta, this.sessionHandler)
  }

  async getStrengthExerciseVariant (params: { id: number }) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:show', { ...params }) as StrengthExerciseVariantResponse
    return new StrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)
  }

  async getStrengthExerciseMuscle (params: { id: number }) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { ...params }) as StrengthExerciseMuscleResponse
    return new StrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)
  }

  async getStretchExercise (params: { id: number }) {
    const { stretchExercise } = await this.action('stretchExercise:show', params) as StretchExerciseResponse
    return new StretchExercise(stretchExercise, this.sessionHandler)
  }

  async getStretchExercises (options: { imageUri?: string, instructionalVideoUri?: string, sort?: StretchExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { stretchExercises, stretchExercisesMeta } = await this.action('stretchExercise:list', options) as StretchExerciseListResponse
    return new StretchExercises(stretchExercises, stretchExercisesMeta, this.sessionHandler)
  }

  async getStretchExerciseVariant (params: { id: number }) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:show', { ...params }) as StretchExerciseVariantResponse
    return new StretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)
  }

  async getStretchExerciseMuscle (params: { id: number }) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { ...params }) as StretchExerciseMuscleResponse
    return new StretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)
  }

  async getCardioExercise (params: { id: number }) {
    const { cardioExercise } = await this.action('cardioExercise:show', params) as CardioExerciseResponse
    return new CardioExercise(cardioExercise, this.sessionHandler)
  }

  async getCardioExercises (options: { defaultAlias?: string, sort?: CardioExerciseSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioExercises, cardioExercisesMeta } = await this.action('cardioExercise:list', options) as CardioExerciseListResponse
    return new CardioExercises(cardioExercises, cardioExercisesMeta, this.sessionHandler)
  }

  async getCardioMachine (params: { id: number }) {
    const { cardioMachine } = await this.action('cardioMachine:show', params) as CardioMachineResponse
    return new CardioMachine(cardioMachine, this.sessionHandler)
  }

  async getCardioMachines (options: { name?: string, sort?: CardioMachineSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { cardioMachines, cardioMachinesMeta } = await this.action('cardioMachine:list', options) as CardioMachineListResponse
    return new CardioMachines(cardioMachines, cardioMachinesMeta, this.sessionHandler)
  }

  async getCardioExerciseVariant (params: { id: number }) {
    const { cardioExerciseVariant } = await this.action('cardioExerciseVariant:show', { ...params }) as CardioExerciseVariantResponse
    return new CardioExerciseVariant(cardioExerciseVariant, this.sessionHandler)
  }

  async getCardioExerciseMuscle (params: { id: number }) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { ...params }) as CardioExerciseMuscleResponse
    return new CardioExerciseMuscle(cardioExerciseMuscle, this.sessionHandler)
  }

  async getFacility (params: { id: number }) {
    const { facility } = await this.action('facility:show', params) as FacilityResponse
    return new Facility(facility, this.sessionHandler)
  }

  async getFacilities (options: { name?: string, phone?: string, address?: string, city?: string, postcode?: string, state?: string, country?: string, sort?: FacilitySorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilities, facilitiesMeta } = await this.action('facility:list', options) as FacilityListResponse
    return new Facilities(facilities, facilitiesMeta, this.sessionHandler)
  }
}

export class UserSession extends UserSessionBase<User> {
  protected readonly _user: User

  constructor (userResponse: UserResponse, connection: MetricsConnection) {
    super(userResponse, connection)
    this._user = new User(userResponse.user, this._sessionHandler)
  }
}

export class FacilityUserSession extends UserSessionBase<FacilityMemberUser> {
  protected readonly _user: FacilityMemberUser
  protected readonly _facilityRelationship: UserFacilityRelationship

  constructor (facilityUserResponse: FacilityUserResponse, connection: MetricsConnection) {
    super({ ...facilityUserResponse, user: facilityUserResponse.facilityRelationship.user }, connection)
    this._user = new FacilityMemberUser(facilityUserResponse.facilityRelationship.user, this._sessionHandler, facilityUserResponse.facilityRelationship.id)
    this._facilityRelationship = new UserFacilityRelationship(facilityUserResponse.facilityRelationship, this._sessionHandler)
  }

  get facilityRelationship () {
    return this._facilityRelationship
  }
}

export class OAuthSession extends UserSessionBase<User> {
  protected _user: User
  protected _sessionHandler: OAuthSessionHandler
  private readonly _userApplicationAuthorizationId: number

  constructor (oauthUserResponse: OAuthUserResponse, connection: MetricsConnection) {
    super(oauthUserResponse, connection)
    this._sessionHandler = new OAuthSessionHandler(connection, oauthUserResponse)
    this._user = new User(oauthUserResponse.user, this._sessionHandler)
    this._userApplicationAuthorizationId = this._sessionHandler.decodedAccessToken.userApplicationAuthorization.id
  }

  get sessionHandler () {
    return this._sessionHandler
  }

  get accessToken () {
    return this._sessionHandler.accessToken
  }

  get refreshToken () {
    return this._sessionHandler.refreshToken
  }

  get expiresIn () {
    return this._sessionHandler.expiresIn
  }

  get userApplicationAuthorizationId () {
    return this._userApplicationAuthorizationId
  }

  close () {
    this._sessionHandler.close()
  }

  async logout () {
    await this._sessionHandler.logout()
  }
}

export type SessionHandler = UserSessionHandler | KioskSessionHandler | StrengthMachineSessionHandler
