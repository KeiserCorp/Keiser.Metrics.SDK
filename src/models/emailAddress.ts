import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface EmailAddressData {
  id: number
  email: string
  validated: boolean
}

export interface EmailAddressResponse extends AuthenticatedResponse {
  emailAddress: EmailAddressData
}

export interface EmailAddressListResponse extends AuthenticatedResponse {
  emailAddresses: EmailAddressData[]
}

export class EmailAddress extends Model {
  private _emailAddressData: EmailAddressData
  private _userId: number

  constructor (emailAddressData: EmailAddressData, userId: number, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._emailAddressData = emailAddressData
    this._userId = userId
  }

  private setEmailAddressData (emailAddressData: EmailAddressData) {
    Object.assign(this._emailAddressData, emailAddressData)
  }

  async reload () {
    const { emailAddress } = await this.action('emailAddress:show', { userId: this._userId, id: this.id }) as EmailAddressResponse
    this.setEmailAddressData(emailAddress)
    return this
  }

  async requestValidation () {
    await this.action('emailAddress:validationRequest', { userId: this._userId, id: this.id })
  }

  async fulfillValidation (token: string) {
    if (this._userId !== this.sessionHandler.decodedAccessToken.user.id) {
      throw new Error('Cannot perform validation fulfillment for other users')
    }

    await this.action('emailAddress:validationFulfillment', { validationToken: token })
  }

  async delete () {
    await this.action('emailAddress:delete', { userId: this._userId, id: this.id })
  }

  get id () {
    return this._emailAddressData.id
  }

  get email () {
    return this._emailAddressData.email
  }

  get validated () {
    return this._emailAddressData.validated
  }
}
