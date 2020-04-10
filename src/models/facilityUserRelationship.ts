import { SessionHandler } from '../session'
import { FacilityRelationship, FacilityRelationshipData, FacilityRelationshipResponse } from './facilityRelationship'
import { User } from './user'

export class FacilityUserRelationship extends FacilityRelationship {
  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(facilityRelationshipData, sessionHandler)
  }

  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberIdentifier?: string, member?: boolean, employeeRole?: string}) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityUpdate', { ...params, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:facilityDelete', { id: this.id })
  }

  get user () {
    return this._facilityRelationshipData.user ? new User(this._facilityRelationshipData.user, this.sessionHandler) : undefined
  }
}
