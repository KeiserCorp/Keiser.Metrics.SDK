import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum FacilityAccessControlIPRangeSorting {
  ID = 'id',
  Name = 'name'
}

export interface FacilityAccessControlIPRangeData {
  id: number
  cidr: string
}

export interface FacilityAccessControlIPRangeResponse extends AuthenticatedResponse {
  facilityAccessControlIPRange: FacilityAccessControlIPRangeData
}

export interface FacilityAccessControlIPRangeListResponse extends AuthenticatedResponse {
  facilityAccessControlIPRanges: FacilityAccessControlIPRangeData[]
  facilityAccessControlIPRangesMeta: FacilityAccessControlIPRangeListResponseMeta
}

export interface FacilityAccessControlIPRangeListResponseMeta extends ListMeta {
  cidr: string | undefined
  from: string | undefined
  to: string | undefined
  source: string
  sort: FacilityAccessControlIPRangeSorting
}

export class FacilityAccessControlIPRanges extends ModelList<FacilityAccessControlIPRange, FacilityAccessControlIPRangeData, FacilityAccessControlIPRangeListResponseMeta> {
  constructor (facilityAccessControlIPRanges: FacilityAccessControlIPRangeData[], facilityAccessControlIPRangeListResponseMeta: FacilityAccessControlIPRangeListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityAccessControlIPRange, facilityAccessControlIPRanges, facilityAccessControlIPRangeListResponseMeta, sessionHandler)
  }
}

export class FacilityAccessControlIPRange extends Model {
  private _facilityAccessControlIPRangeData: FacilityAccessControlIPRangeData

  constructor (facilityAccessControlIPRangeData: FacilityAccessControlIPRangeData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityAccessControlIPRangeData = facilityAccessControlIPRangeData
  }

  private setFacilityAccessControlIPRangeData (facilityAccessControlIPRangeData: FacilityAccessControlIPRangeData) {
    this._facilityAccessControlIPRangeData = facilityAccessControlIPRangeData
  }

  async reload () {
    const { facilityAccessControlIPRange } = await this.action('facilityAccessControlIPRange:show', { id: this.id }) as FacilityAccessControlIPRangeResponse
    this.setFacilityAccessControlIPRangeData(facilityAccessControlIPRange)
    return this
  }

  async update (params: { cidr: string }) {
    const { facilityAccessControlIPRange } = await this.action('facilityAccessControlIPRange:update', { ...params, id: this.id }) as FacilityAccessControlIPRangeResponse
    this.setFacilityAccessControlIPRangeData(facilityAccessControlIPRange)
    return this
  }

  async delete () {
    await this.action('facilityAccessControlIPRange:delete', { id: this.id })
  }

  get id () {
    return this._facilityAccessControlIPRangeData.id
  }

  get cidr () {
    return this._facilityAccessControlIPRangeData.cidr
  }
}
