import { SessionHandler, AuthenticatedResponse } from '../session'
import { Model } from '../model'
import { FacilityData } from './facility'
import { UserData } from './user'

export interface FacilityRelationshipData {
  id: number
  userId: number
  facilityId: number
  member: boolean
  memberIdentifier: string | null
  hasSecretSet: boolean
  employeeRole: string | null
  facility?: FacilityData
  user?: UserData
}

export interface FacilityRelationshipResponse extends AuthenticatedResponse {
  facilityRelationship: FacilityRelationshipData
}

export interface FacilityRelationshipListResponse extends AuthenticatedResponse {
  facilityRelationships: FacilityRelationshipData[]
}

export class FacilityRelationship extends Model {
  protected _facilityRelationshipData: FacilityRelationshipData

  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityRelationshipData = facilityRelationshipData
  }

  protected setFacilityRelationshipData (facilityRelationshipData: FacilityRelationshipData) {
    Object.assign(this._facilityRelationshipData, facilityRelationshipData)
  }

  get id () {
    return this._facilityRelationshipData.id
  }

  get userId () {
    return this._facilityRelationshipData.userId
  }

  get facilityId () {
    return this._facilityRelationshipData.facilityId
  }

  get member () {
    return this._facilityRelationshipData.member
  }

  get memberIdentifier () {
    return this._facilityRelationshipData.memberIdentifier
  }

  get hasSecretSet () {
    return this._facilityRelationshipData.hasSecretSet
  }

  get employeeRole () {
    return this._facilityRelationshipData.employeeRole
  }
}
