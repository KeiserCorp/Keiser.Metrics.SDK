import Metrics from './core'
import { ClientSideActionPrevented } from './error'
import { DecodeJWT } from './lib/jwt'
import { UserResponse } from './models/user'
import { AccessToken, AdminSession } from './session'

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
