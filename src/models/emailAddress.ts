import { ListMeta, Model, ModelList } from '../model'
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
  email?: string
  sort: EmailAddressSorting
}

export class EmailAddresses extends ModelList<EmailAddress, EmailAddressData, EmailAddressListResponseMeta> {
  constructor (emailAddresses: EmailAddressData[], emailAddressesMeta: EmailAddressListResponseMeta, sessionHandler: SessionHandler) {
    super(EmailAddress, emailAddresses, emailAddressesMeta, sessionHandler)
  }
}

export class EmailAddress extends Model {
  private _emailAddressData: EmailAddressData

  constructor (emailAddressData: EmailAddressData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._emailAddressData = emailAddressData
  }

  private setEmailAddressData (emailAddressData: EmailAddressData) {
    this._emailAddressData = emailAddressData
  }

  async reload () {
    const { emailAddress } = await this.action('emailAddress:show', { id: this.id }) as EmailAddressResponse
    this.setEmailAddressData(emailAddress)
    return this
  }

  async requestValidation () {
    await this.action('emailAddress:validationRequest', { id: this.id })
  }

  async fulfillValidation (token: string) {
    await this.action('emailAddress:validationFulfillment', { validationToken: token })
  }

  async delete () {
    await this.action('emailAddress:delete', { id: this.id })
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
