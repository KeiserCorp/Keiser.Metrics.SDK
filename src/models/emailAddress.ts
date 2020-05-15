import { ClientSideActionPrevented } from '../error'
import { ListMeta, Model, UserModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export enum EmailAddressSorting {
  ID = 'id',
  Email = 'email'
}

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
  emailAddressesMeta: EmailAddressListResponseMeta
}

export interface EmailAddressListResponseMeta extends ListMeta {
  email: string | undefined
  sort: EmailAddressSorting
}

export class EmailAddresses extends UserModelList<EmailAddress, EmailAddressData, EmailAddressListResponseMeta> {
  constructor (emailAddresses: EmailAddressData[], emailAddressesMeta: EmailAddressListResponseMeta, sessionHandler: SessionHandler, userId: number) {
    super(EmailAddress, emailAddresses, emailAddressesMeta, sessionHandler, userId)
  }
}

export class EmailAddress extends Model {
  private _emailAddressData: EmailAddressData
  private _userId: number

  constructor (emailAddressData: EmailAddressData, sessionHandler: SessionHandler, userId: number) {
    super(sessionHandler)
    this._emailAddressData = emailAddressData
    this._userId = userId
  }

  private setEmailAddressData (emailAddressData: EmailAddressData) {
    this._emailAddressData = emailAddressData
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
      throw new ClientSideActionPrevented({ explanation: 'Cannot perform validation fulfillment for other users' })
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
