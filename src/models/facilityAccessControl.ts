import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { FacilityAccessControlIPRange, FacilityAccessControlIPRangeListResponse, FacilityAccessControlIPRangeResponse, FacilityAccessControlIPRanges, FacilityAccessControlIPRangeSorting } from './facilityAccessControlIPRange'
import { FacilityAccessControlKiosk } from './facilityAccessControlKiosk'

export interface FacilityAccessControlData {
  facilityAccessControlIPRanges?: FacilityAccessControlIPRange[]
  facilityAccessControlKiosk?: FacilityAccessControlKiosk
}

export interface FacilityAccessControlResponse extends AuthenticatedResponse {
  facilityAccessControl: FacilityAccessControlData
}

export class FacilityAccessControl extends Model {
  private _facilityAccessControlData: FacilityAccessControlData

  constructor (facilityAccessControlData: FacilityAccessControlData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityAccessControlData = facilityAccessControlData
  }

  private setFacilityAccessControlData (facilityAccessControlData: FacilityAccessControlData) {
    this._facilityAccessControlData = facilityAccessControlData
  }

  async reload () {
    const { facilityAccessControl } = await this.action('facilityAccessControl:show') as FacilityAccessControlResponse
    this.setFacilityAccessControlData(facilityAccessControl)
    return this
  }

  eagerFacilityAccessControlIPRanges () {
    return typeof this._facilityAccessControlData.facilityAccessControlIPRanges !== 'undefined' ? this._facilityAccessControlData.facilityAccessControlIPRanges.map(facilityAccessControlIPRange => new FacilityAccessControlIPRange(facilityAccessControlIPRange, this.sessionHandler)) : undefined
  }

  async createFacilityAccessControlIPRange (params: { cidr: string }) {
    const { facilityAccessControlIPRange } = await this.action('facilityAccessControlIPRange:create', params) as FacilityAccessControlIPRangeResponse
    return new FacilityAccessControlIPRange(facilityAccessControlIPRange, this.sessionHandler)
  }

  async getFacilityAccessControlIPRange (params: { id: number }) {
    const { facilityAccessControlIPRange } = await this.action('facilityAccessControlIPRange:show', params) as FacilityAccessControlIPRangeResponse
    return new FacilityAccessControlIPRange(facilityAccessControlIPRange, this.sessionHandler)
  }

  async getFacilityAccessControlIPRanges (options: { cidr?: string, sort?: FacilityAccessControlIPRangeSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityAccessControlIPRanges, facilityAccessControlIPRangesMeta } = await this.action('facilityAccessControlIPRange:list', options) as FacilityAccessControlIPRangeListResponse
    return new FacilityAccessControlIPRanges(facilityAccessControlIPRanges, facilityAccessControlIPRangesMeta, this.sessionHandler)
  }

  eagerFacilityAccessControlKiosk () {
    return typeof this._facilityAccessControlData.facilityAccessControlKiosk !== 'undefined' ? new FacilityAccessControlKiosk(this._facilityAccessControlData.facilityAccessControlKiosk, this.sessionHandler) : undefined
  }
}
