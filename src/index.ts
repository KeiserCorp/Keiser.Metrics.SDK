import { ConnectionOptions, MetricsConnection } from './connection'
import { Core } from './models/core'
import { OAuthProviders } from './models/oauthService'
import { Authentication } from './session'

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

  async authenticateWithCredentials (params: { email: string, password: string, refreshable?: boolean }) {
    return await Authentication.useCredentials(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithToken (params: { token: string }) {
    return await Authentication.useToken(this._connection, params)
  }

  async authenticateWithResetToken (params: { resetToken: string, password: string, refreshable?: boolean }) {
    return await Authentication.useResetToken(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithWelcomeToken (params: { welcomeToken: string, password: string, refreshable?: boolean }) {
    return await Authentication.useWelcomeToken(this._connection, { refreshable: true, ...params })
  }

  async authenticateWithKioskToken (params: { kioskToken: string }) {
    return await Authentication.useKioskToken(this._connection, params)
  }

  async authenticateWithA500MachineToken (params: { machineInitializerToken: string, machineModel: number, firmwareVersion: string, softwareVersion: string, mainBoardSerial: string, displayUUID: string, leftCylinderSerial: string, rightCylinderSerial?: string }) {
    return await Authentication.checkInMachine(this._connection, params)
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

  async passwordReset (params: { email: string }) {
    await Authentication.passwordReset(this._connection, params)
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
