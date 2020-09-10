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
    const { primaryEmailAddress } = await this.action('primaryEmailAddress:show', { userId: this._primaryEmailAddressData.userId }) as PrimaryEmailAddressResponse
    this.setPrimaryEmailAddressData(primaryEmailAddress)
    return this
  }

  async update (emailAddress: EmailAddress) {
    const { primaryEmailAddress } = await this.action('primaryEmailAddress:update', { userId: this._primaryEmailAddressData.userId, emailAddressId: emailAddress.id }) as PrimaryEmailAddressResponse
    this.setPrimaryEmailAddressData(primaryEmailAddress)
    return this
  }

  get emailAddressId () {
    return this._primaryEmailAddressData.emailAddressId
  }

  async getEmailAddress () {
    const { emailAddress } = await this.action('emailAddress:show', { userId: this._primaryEmailAddressData.userId, id: this.emailAddressId }) as EmailAddressResponse
    return new EmailAddress(emailAddress, this.sessionHandler)
  }
}
