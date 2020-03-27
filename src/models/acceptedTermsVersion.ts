import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'

export interface AcceptedTermsVersionData {
  updatedAt: string
  revision: string
}

export interface AcceptedTermsVersionResponse extends AuthenticatedResponse {
  acceptedTermsVersion: AcceptedTermsVersionData
}

export class AcceptedTermsVersion extends Model {
  private _acceptedTermsVersionData: AcceptedTermsVersionData
  private _userId: number

  constructor (acceptedTermsVersion: AcceptedTermsVersionData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._acceptedTermsVersionData = acceptedTermsVersion
    this._userId = userId
  }

  private setAcceptedTermsVersionData (acceptedTermsVersion: AcceptedTermsVersionData) {
    Object.assign(this._acceptedTermsVersionData, acceptedTermsVersion)
  }

  async reload () {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:show', { userId: this._userId }) as AcceptedTermsVersionResponse
    this.setAcceptedTermsVersionData(acceptedTermsVersion)
    return this
  }

  async update (params: {revision: string}) {
    const { acceptedTermsVersion } = await this.action('acceptedTermsVersion:update', { userId: this._userId, ...params }) as AcceptedTermsVersionResponse
    this.setAcceptedTermsVersionData(acceptedTermsVersion)
    return this
  }

  get updatedAt () {
    return new Date(this._acceptedTermsVersionData.updatedAt)
  }

  get revision () {
    return this._acceptedTermsVersionData.revision
  }
}
