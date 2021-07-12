import { ConnectionOptions, MetricsConnection } from './connection'
import { Units } from './constants'
import { ClientSideActionPrevented } from './error'
import { DecodeJWT } from './lib/jwt'
import { Core } from './models/core'
import { OAuthProviders } from './models/oauthService'
import { Gender } from './models/profile'
import { StrengthMachineIdentifier } from './models/strengthMachine'
import { ExchangeableUserResponse, UserResponse } from './models/user'
import { AccessToken, AdminSession, CheckReturnRouteResponse, ExchangeableAdminSession, ExchangeableUserSession, KioskSession, RedirectResponse, StrengthMachineInitializeResponse, StrengthMachineSession, UserSession } from './session'

export default class Metrics {
  protected readonly _connection: MetricsConnection
  protected readonly _core: Core

  constructor (options: ConnectionOptions = { }) {
    this._connection = new MetricsConnection(options)
    this._core = new Core(this._connection)
  }

  get onDisposeEvent () {
    return this._connection.onDisposeEvent
  }

  get socketConnected () {
    return this._connection.socketConnected
  }

  get persistConnection () {
    return this._connection.persistConnection
  }

  get core () {
    return this._core
  }

  dispose () {
    this._connection.dispose()
  }

  async action (action: string, params: Object = { }) {
    return await this._connection.action(action, params)
  }

  get onConnectionChangeEvent () {
    return this._connection.onConnectionChangeEvent
  }

  async authenticateWithExchangeToken (params: { exchangeToken: string}) {
    const response = await this._connection.action('auth:exchangeFulfillment', params) as UserResponse
    return new UserSession(response, this._connection)
  }

  /** @deprecated */
  async authenticateWithCredentials (params: { email: string, password: string, refreshable?: boolean }) {
    const response = await this._connection.action('auth:login', { refreshable: true, ...params }) as UserResponse
    return new UserSession(response, this._connection)
  }

  /** @deprecated */
  async authenticateWithWelcomeToken (params: { welcomeToken: string, password: string, refreshable?: boolean }) {
    const response = await this._connection.action('auth:facilityWelcomeFulfillment', { refreshable: true, ...params }) as UserResponse
    return new UserSession(response, this._connection)
  }

  async authenticateWithToken (params: { token: string }) {
    const response = await this._connection.action('user:show', { authorization: params.token }) as UserResponse
    return new UserSession(response, this._connection)
  }

  async authenticateWithKioskToken (params: { kioskToken: string }) {
    await this._connection.action('facilityKioskToken:check', { authorization: params.kioskToken })
    return new KioskSession({ accessToken: params.kioskToken }, this._connection)
  }

  async authenticateWithMachineToken (params: { machineToken: string, strengthMachineIdentifier: StrengthMachineIdentifier }) {
    const initializationParams = {
      ...params.strengthMachineIdentifier,
      authorization: params.machineToken
    }
    const response = await this._connection.action('a500:initialize', initializationParams) as StrengthMachineInitializeResponse
    return new StrengthMachineSession(response, this._connection)
  }

  async authenticateWithMachineInitializerToken (params: { machineInitializerToken: string, strengthMachineIdentifier: StrengthMachineIdentifier }) {
    const initializationParams = {
      ...params.strengthMachineIdentifier,
      authorization: params.machineInitializerToken
    }
    const response = await this._connection.action('a500:initialize', initializationParams) as StrengthMachineInitializeResponse
    return new StrengthMachineSession(response, this._connection)
  }
}

/** @hidden */
export class MetricsSSO extends Metrics {
  async isReturnRouteValid (params: {returnUrl: string}) {
    const response = await this._connection.action('auth:validateReturnRoute', params) as CheckReturnRouteResponse
    return response.valid
  }

  async authenticateWithCredentials (params: { email: string, password: string, refreshable?: boolean, requiresElevated?: boolean}) {
    const response = await this._connection.action('auth:login', { refreshable: true, ...params, apiVersion: 1 }) as ExchangeableUserResponse
    return new ExchangeableUserSession(response, this._connection)
  }

  async initializeUserCreation (params: { email: string, returnUrl: string, requiresElevated?: boolean, name?: string, birthday?: string, gender?: Gender, language?: string, units?: Units, metricWeight?: number, metricHeight?: number }) {
    await this._connection.action('auth:userInit', params)
  }

  async initiatePasswordReset (params: { email: string, returnUrl: string, requiresElevated?: boolean }) {
    await this._connection.action('auth:resetRequest', { ...params, apiVersion: 1 })
  }

  async fulfillUserCreation (params: { authorizationCode: string, password: string, refreshable?: boolean, requiresElevated?: boolean, acceptedTermsRevision: string, name: string, birthday: string, gender: Gender, language: string, units: Units, metricWeight?: number, metricHeight?: number}) {
    const response = await this._connection.action('auth:userInitFulfillment', { refreshable: true, params }) as ExchangeableUserResponse
    return new ExchangeableUserSession(response, this._connection)
  }

  async authenticateWithWelcomeToken (params: { welcomeToken: string, password: string, refreshable?: boolean }) {
    const response = await this._connection.action('auth:facilityWelcomeFulfillment', { refreshable: true, params }) as ExchangeableUserResponse
    return new ExchangeableUserSession(response, this._connection)
  }

  async initiateOAuthWithFacebook (params: { redirect: string }) {
    const response = await this._connection.action('oauth:initiate', { ...params, type: 'login', service: OAuthProviders.Facebook }) as RedirectResponse
    return { redirectUrl: response.url }
  }

  async initiateOAuthWithGoogle (params: { redirect: string }) {
    const response = await this._connection.action('oauth:initiate', { ...params, type: 'login', service: OAuthProviders.Google }) as RedirectResponse
    return { redirectUrl: response.url }
  }

  async initiateOAuthWithApple (params: { redirect: string }) {
    const response = await this._connection.action('oauth:initiate', { ...params, type: 'login', service: OAuthProviders.Apple }) as RedirectResponse
    return { redirectUrl: response.url }
  }

  async authenticateWithResetToken (params: { resetToken: string, password: string, refreshable?: boolean, requiresElevated?: boolean}) {
    const response = await this._connection.action('auth:resetFulfillment', { refreshable: true, ...params, apiVersion: 1 }) as ExchangeableUserResponse
    return new ExchangeableUserSession(response, this._connection)
  }

  async getExchangeableUserSession (userSession: UserSession) {
    const response = await userSession.sessionHandler.action('auth:exchangeInit') as ExchangeableUserResponse
    return new ExchangeableUserSession(response, userSession.sessionHandler.connection)
  }

  async elevateUserSession (userSession: UserSession, params: { otpToken: string, refreshable?: boolean }) {
    const response = await userSession.sessionHandler.action('auth:elevate', { refreshable: true, ...params }) as ExchangeableUserResponse
    const accessToken = DecodeJWT(response.accessToken)
    if (typeof accessToken.globalAccessControl === 'undefined' || accessToken.globalAccessControl === null) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for admin session.' })
    }
    return new ExchangeableAdminSession(response, userSession.sessionHandler.connection, accessToken.globalAccessControl)
  }
}

/** @hidden */
export class MetricsAdmin extends Metrics {
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
