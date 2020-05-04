import { ClientSideActionPrevented } from '../error'
import { ListMeta, Model, ModelList } from '../model'
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
  emailAddressesMeta: EmailAddressListResponseMeta
}

export interface EmailAddressListResponseMeta extends ListMeta {
  email: string | undefined
  sort: 'id' | 'email'
}

export class EmailAddresses extends ModelList<EmailAddress, EmailAddressListResponseMeta> {
  constructor (emailAddresses: EmailAddressData[], emailAddressesMeta: EmailAddressListResponseMeta, userId: number, sessionHandler: SessionHandler) {
    super((emailAddresses || []).map(emailAddress => new EmailAddress(emailAddress, userId, sessionHandler)), emailAddressesMeta)
  }
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
