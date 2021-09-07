import { MetricsConnection } from './connection'
import { Units } from './constants'
import Metrics from './core'
import { ClientSideActionPrevented } from './error'
import { DecodeJWT } from './lib/jwt'
import { GlobalAccessControl, GlobalAccessControlData } from './models/globalAccessControl'
import { OAuthProviders } from './models/oauthService'
import { Gender } from './models/profile'
import { ExchangeableUserResponse } from './models/user'
import { CheckReturnRouteResponse, RedirectResponse, UserSession } from './session'

export default class MetricsSSO extends Metrics {
  async isReturnRouteValid (params: {returnUrl: string}) {
    const response = await this._connection.action('auth:validateReturnRoute', params) as CheckReturnRouteResponse
    return response.valid
  }

  async authenticateWithToken (params: { token: string }) {
    const response = await this._connection.action('auth:exchangeInit', { authorization: params.token }) as ExchangeableUserResponse
    return new ExchangeableUserSession(response, this._connection)
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

  async elevateUserSession (userSession: UserSession, params: { otpToken: string, refreshable?: boolean }) {
    const response = await userSession.sessionHandler.action('auth:elevate', { refreshable: true, ...params }) as ExchangeableUserResponse
    const accessToken = DecodeJWT(response.accessToken)
    if (typeof accessToken.globalAccessControl === 'undefined' || accessToken.globalAccessControl === null) {
      throw new ClientSideActionPrevented({ explanation: 'Session token is not valid for admin session.' })
    }
    return new ExchangeableAdminSession(response, userSession.sessionHandler.connection, accessToken.globalAccessControl)
  }
}

export class ExchangeableUserSession extends UserSession {
  protected readonly _exchangeToken: string

  constructor (exchangeableUserResponse: ExchangeableUserResponse, connection: MetricsConnection) {
    super(exchangeableUserResponse, connection)
    this._exchangeToken = exchangeableUserResponse.exchangeToken
  }

  get exchangeToken () {
    return this._exchangeToken
  }
}

export class ExchangeableAdminSession extends ExchangeableUserSession {
  private readonly _globalAccessControl: GlobalAccessControl

  constructor (exchangeableUserResponse: ExchangeableUserResponse, connection: MetricsConnection, globalAccessControlData: GlobalAccessControlData) {
    super(exchangeableUserResponse, connection)
    this._globalAccessControl = new GlobalAccessControl(globalAccessControlData, this.sessionHandler)
  }

  get globalAccessControl () {
    return this._globalAccessControl
  }
}
