import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { EmailAddress, EmailAddressResponse } from './emailAddress'

export interface PrimaryEmailAddressData {
  userId: number
  emailAddressId: number
}

export interface PrimaryEmailAddressResponse extends AuthenticatedResponse {
  primaryEmailAddress: PrimaryEmailAddressData
}

export class PrimaryEmailAddress extends Model {
  private _primaryEmailAddressData: PrimaryEmailAddressData

  constructor (primaryEmailAddressData: PrimaryEmailAddressData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._primaryEmailAddressData = primaryEmailAddressData
  }

  private setPrimaryEmailAddressData (primaryEmailAddress: PrimaryEmailAddressData) {
    this._primaryEmailAddressData = primaryEmailAddress
  }

  async reload () {
    const { primaryEmailAddress } = await this.action('primaryEmailAddress:show', { userId: this.userId }) as PrimaryEmailAddressResponse
    this.setPrimaryEmailAddressData(primaryEmailAddress)
    return this
  }

  async update (params: { emailAddressId: number }) {
    const { primaryEmailAddress } = await this.action('primaryEmailAddress:update', { ...params, userId: this.userId }) as PrimaryEmailAddressResponse
    this.setPrimaryEmailAddressData(primaryEmailAddress)
    return this
  }

  get emailAddressId () {
    return this._primaryEmailAddressData.emailAddressId
  }

  get userId () {
    return this._primaryEmailAddressData.userId
  }

  async getEmailAddress () {
    const { emailAddress } = await this.action('emailAddress:show', { id: this.emailAddressId, userId: this.userId }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.sessionHandler)
  }
}
