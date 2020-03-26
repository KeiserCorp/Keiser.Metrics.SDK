import { AuthenticatedResponse } from '../session'

export interface PrimaryEmailAddressData {
  emailAddressId: number
}

export interface PrimaryEmailAddressResponse extends AuthenticatedResponse {
  emailAddress: PrimaryEmailAddressData
}
