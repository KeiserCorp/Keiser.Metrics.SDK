import { AuthenticatedResponse } from '../session'

export interface FacilityKioskTokenResponse extends AuthenticatedResponse {
  kioskToken: string
}
