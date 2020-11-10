import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum OAuthServiceSorting {
  ID = 'id',
  Name = 'name'
}

export const enum OAuthProviders {
  Apple = 'apple',
  Google = 'google',
  Facebook = 'facebook',
  Strava = 'strava',
  TrainingPeaks = 'trainingpeaks'
}

export interface OAuthServiceData {
  id: number
  service: OAuthProviders
  remoteUserId: string
  lastTransaction: string | null
  reauthRequired: boolean
}

export interface OAuthServiceResponse extends AuthenticatedResponse {
  oauthService: OAuthServiceData
}

export interface OAuthServiceListResponse extends AuthenticatedResponse {
  oauthServices: OAuthServiceData[]
  oauthServicesMeta: OAuthServiceListResponseMeta
}

export interface OAuthServiceListResponseMeta extends ListMeta {
  source: string
  machineType: string
  sort: OAuthServiceSorting
}

export class OAuthServices extends ModelList<OAuthService, OAuthServiceData, OAuthServiceListResponseMeta> {
  constructor (oauthServices: OAuthServiceData[], OAuthServicesMeta: OAuthServiceListResponseMeta, sessionHandler: SessionHandler) {
    super(OAuthService, oauthServices, OAuthServicesMeta, sessionHandler)
  }
}

export class OAuthService extends Model {
  private _oauthServiceData: OAuthServiceData

  constructor (oauthServiceData: OAuthServiceData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._oauthServiceData = oauthServiceData
  }

  private setOAuthServiceData (oauthServiceData: OAuthServiceData) {
    this._oauthServiceData = oauthServiceData
  }

  async reload () {
    const { oauthService } = await this.action('oauthService:show', { id: this.id }) as OAuthServiceResponse
    this.setOAuthServiceData(oauthService)
    return this
  }

  async delete () {
    await this.action('oauthService:delete', { id: this.id })
  }

  get id () {
    return this._oauthServiceData.id
  }

  get service () {
    return this._oauthServiceData.service
  }

  get remoteUserId () {
    return this._oauthServiceData.remoteUserId
  }

  get lastTransaction () {
    return this._oauthServiceData.lastTransaction !== null ? new Date(this._oauthServiceData.lastTransaction) : null
  }

  get reauthRequired () {
    return this._oauthServiceData.reauthRequired
  }
}
