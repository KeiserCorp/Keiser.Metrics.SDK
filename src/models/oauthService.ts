import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface OAuthServiceData {
  id: number
  name: string
  lastTransaction: string | null
  reauthRequired: boolean
}

export interface OAuthServiceResponse extends AuthenticatedResponse {
  oauthService: OAuthServiceData
}

export interface OAuthServiceListResponse extends AuthenticatedResponse {
  oauthServices: OAuthServiceData[]
}

export class OAuthService extends Model {
  private _oauthServiceData: OAuthServiceData
  private _userId: number

  constructor (oauthServiceData: OAuthServiceData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._oauthServiceData = oauthServiceData
    this._userId = userId
  }

  private setOAuthServiceData (oauthServiceData: OAuthServiceData) {
    Object.assign(this._oauthServiceData, oauthServiceData)
  }

  async reload () {
    const { oauthService } = await this.action('oauthService:show', { userId: this._userId, id: this.id }) as OAuthServiceResponse
    this.setOAuthServiceData(oauthService)
    return this
  }

  async delete () {
    await this.action('oauthService:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._oauthServiceData.id
  }

  get name () {
    return this._oauthServiceData.name
  }

  get lastTransaction () {
    return this._oauthServiceData.lastTransaction ? new Date(this._oauthServiceData.lastTransaction) : null
  }

  get reauthRequired () {
    return this._oauthServiceData.reauthRequired
  }
}
