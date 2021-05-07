import { ConnectionOptions, MetricsConnection } from './connection'
import { Units } from './constants'
import { Core } from './models/core'
import { OAuthProviders } from './models/oauthService'
import { Gender } from './models/profile'
import { StrengthMachineIdentifier } from './models/strengthMachine'
import { Authentication, SSO } from './session'

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
    return await Authentication.useExchangeToken(this._connection, params)
  }

  /** @deprecated */
  async authenticateWithCredentials (params: { email: string, password: string, refreshable?: boolean }) {
    return await Authentication.useCredentials(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithToken (params: { token: string }) {
    return await Authentication.useToken(this._connection, params)
  }

  async authenticateWithWelcomeToken (params: { welcomeToken: string, password: string, refreshable?: boolean }) {
    return await Authentication.useWelcomeToken(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithKioskToken (params: { kioskToken: string }) {
    return await Authentication.useKioskToken(this._connection, params)
  }

  async authenticateWithMachineToken (params: { machineToken: string, strengthMachineIdentifier: StrengthMachineIdentifier }) {
    return await Authentication.useMachineToken(this._connection, params)
  }

  async authenticateWithMachineInitializerToken (params: { machineInitializerToken: string, strengthMachineIdentifier: StrengthMachineIdentifier }) {
    return await Authentication.useMachineInitializerToken(this._connection, params)
  }
}

/** @hidden */
export class MetricsSSO extends Metrics {
  async checkReturnRoute (params: {returnUrl: string}) {
    return await SSO.checkReturnRoute(this._connection, params)
  }

  async authenticate (params: { email: string, password: string, refreshable?: boolean}) {
    return await SSO.authenticate(this._connection, params)
  }

  async createUser (params: { email: string, returnUrl: string, requiresElevated?: boolean, name?: string, birthday?: string, gender?: Gender, language?: string, units?: Units, metricWeight?: number, metricHeight?: number }) {
    return await SSO.createUser(this._connection, { refreshable: true, ...params })
  }

  async userFulfillment (params: { authorizationCode: string, password: string, refreshable?: boolean, acceptedTermsRevision: string, name: string, birthday: string, gender: Gender, language: string, units: Units, metricWeight?: number, metricHeight?: number}) {
    return await SSO.userFulfillment(this._connection, params)
  }

  async showUserParams (params: { authorizationCode: string }) {
    return await SSO.showUserParams(this._connection, params)
  }

  async authenticateWithFacebook (params: { redirect: string }) {
    return await SSO.useOAuth(this._connection, { ...params, service: OAuthProviders.Facebook })
  }

  async authenticateWithGoogle (params: { redirect: string }) {
    return await SSO.useOAuth(this._connection, { ...params, service: OAuthProviders.Google })
  }

  async authenticateWithApple (params: { redirect: string }) {
    return await SSO.useOAuth(this._connection, { ...params, service: OAuthProviders.Apple })
  }

  async passwordReset (params: { email: string, returnUrl: string, requiresElevated?: boolean }) {
    await SSO.passwordReset(this._connection, params)
  }

  async authenticateWithResetToken (params: { resetToken: string, password: string, refreshable?: boolean }) {
    return await SSO.useResetToken(this._connection, { refreshable: true, ...params })
  }
}

/** @hidden */
export class MetricsAdmin extends Metrics {
  async authenticateAdminWithCredentials (params: { email: string, password: string, token: string, refreshable?: boolean }) {
    return await Authentication.useAdminCredentials(this._connection, { refreshable: true, ...params })
  }

  async authenticateAdminWithToken (params: { token: string }) {
    return await Authentication.useAdminToken(this._connection, params)
  }
}
