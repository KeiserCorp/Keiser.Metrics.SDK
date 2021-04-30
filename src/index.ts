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

  /**
   * @deprecated This endpoint is being replaced with sso()
   * This will be removed in the next minor version release
  */
  async authenticateWithCredentials (params: { email: string, password: string, refreshable?: boolean }) {
    return await Authentication.useCredentials(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithToken (params: { token: string }) {
    return await Authentication.useToken(this._connection, params)
  }

  /**
   * @deprecated This endpoint is being replaced with sso()
   * This will be removed in the next minor version release
  */
  async authenticateWithResetToken (params: { resetToken: string, password: string, refreshable?: boolean }) {
    return await Authentication.useResetToken(this._connection, { refreshable: true, ...params })
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

  async authenticateWithFacebook (params: { redirect: string }) {
    return await Authentication.useOAuth(this._connection, { ...params, service: OAuthProviders.Facebook })
  }

  async authenticateWithGoogle (params: { redirect: string }) {
    return await Authentication.useOAuth(this._connection, { ...params, service: OAuthProviders.Google })
  }

  async authenticateWithApple (params: { redirect: string }) {
    return await Authentication.useOAuth(this._connection, { ...params, service: OAuthProviders.Apple })
  }

  async createUser (params: { email: string, password: string, refreshable?: boolean }) {
    return await Authentication.createUser(this._connection, { refreshable: true, ...params })
  }

  /**
   * @deprecated This endpoint is being replaced with sso()
   * This will be removed in the next minor version release
  */
  async passwordReset (params: { email: string }) {
    await Authentication.passwordReset(this._connection, params)
  }

  async sso (params: {redirectUrl: string}) {
    return await Authentication.init(this._connection, params)
  }

  /** @hidden */
  async authenticateWithFacilityCredentials (params: {email: string, password: string, refreshable: boolean}) {
    return await Authentication.useFacilityCredentials(this._connection, params)
  }

  /** @hidden */
  async ssoWithCredentials (params: {email: string, password: string, refreshable?: boolean, code: string}) {
    return await SSO.useCredentials(this._connection, { refreshable: true, ...params })
  }

  /** @hidden */
  async ssoWithNewUser (params: { email: string, code: string}) {
    return await SSO.useNewUser(this._connection, params)
  }

  /** @hidden */
  async ssoWithUserFulfillment (params: { code: string, password: string, acceptedTermsRevision: string, name: string, birthday: string, gender: Gender, language: string, units: Units, metricHeight: number, metricWeight: number}) {
    return await SSO.useUserFulfillment(this._connection, params)
  }

  /** @hidden */
  async ssoPasswordReset (params: {email: string}) {
    return await SSO.passwordReset(this._connection, params)
  }

  /** @hidden */
  async ssoWithResetToken (params: {resetToken: string, password: string, refreshable?: boolean, code: string}) {
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
