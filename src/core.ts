import { ConnectionOptions, MetricsConnection } from './connection'
import { Core } from './models/core'
import { StrengthMachineIdentifier } from './models/strengthMachine'
import { UserResponse } from './models/user'
import { KioskSession, StrengthMachineInitializeResponse, StrengthMachineSession, UserSession } from './session'

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
