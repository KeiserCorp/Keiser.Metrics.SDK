import { SessionHandler } from '../session'
import { FacilityRelationship, FacilityRelationshipData, FacilityRelationshipResponse } from './facilityRelationship'
import { Facility } from './facility'

export class UserFacilityRelationship extends FacilityRelationship {
  constructor (facilityRelationshipData: FacilityRelationshipData, sessionHandler: SessionHandler) {
    super(facilityRelationshipData, sessionHandler)
  }

  async reload () {
    const { facilityRelationship } = await this.action('facilityRelationship:userShow', { userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async update (params: { memberSecret: string}) {
    const { facilityRelationship } = await this.action('facilityRelationship:userUpdate', { ...params, userId: this.userId, id: this.id }) as FacilityRelationshipResponse
    this.setFacilityRelationshipData(facilityRelationship)
    return this
  }

  async delete () {
    await this.action('facilityRelationship:userDelete', { userId: this.userId, id: this.id })
  }

  get facility () {
    return this._facilityRelationshipData.facility ? new Facility(this._facilityRelationshipData.facility, this.sessionHandler) : undefined
  }
}
