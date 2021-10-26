import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface AcceptedTermsVersionData {
  userId: number
  updatedAt: string
  revision: string
}

export interface AcceptedTermsVersionResponse extends AuthenticatedResponse {
  acceptedTermsVersion: AcceptedTermsVersionData
}

export class AcceptedTermsVersion extends Model {
  private _acceptedTermsVersionData: AcceptedTermsVersionData

  constructor (acceptedTermsVersion: AcceptedTermsVersionData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._acceptedTermsVersionData = acceptedTermsVersion
  }

  private setAcceptedTermsVersionData (acceptedTermsVersion: AcceptedTermsVersionData) {
    this._acceptedTermsVersionData = acceptedTermsVersion
  }

  async reload () {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:show', { userId: this.userId }) as AcceptedTermsVersionResponse
    this.setAcceptedTermsVersionData(acceptedTermsVersion)
    return this
  }

  async update (params: { revision: string }) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { ...params, userId: this.userId }) as AcceptedTermsVersionResponse
    this.setAcceptedTermsVersionData(acceptedTermsVersion)
    return this
  }

  ejectData () {
    return this.eject(this._acceptedTermsVersionData)
  }

  get userId () {
    return this._acceptedTermsVersionData.userId
  }

  get updatedAt () {
    return new Date(this._acceptedTermsVersionData.updatedAt)
  }

  get revision () {
    return this._acceptedTermsVersionData.revision
  }
}
