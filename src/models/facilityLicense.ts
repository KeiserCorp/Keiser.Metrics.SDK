import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData } from './facility'

const msPerDay = 86400000

export enum LicenseType {
  Normal = 'normal',
  Demo = 'demo',
  Test = 'test'
}

export enum FacilityLicenseSorting {
  ID = 'id',
  Type = 'type',
  Term = 'term',
  EffectiveDate = 'effectiveDate'
}

export interface FacilityLicenseData {
  id: number
  key: string
  accountId: string | null
  term: number
  type: LicenseType
  facilityId: number | null
  effectiveDate: string | null
  facility?: FacilityData
}

export interface FacilityLicenseResponse extends AuthenticatedResponse {
  facilityLicense: FacilityLicenseData
}

export interface FacilityLicenseListResponse extends AuthenticatedResponse {
  facilityLicenses: FacilityLicenseData[]
  facilityLicensesMeta: FacilityLicenseListResponseMeta
}

export interface FacilityLicenseListResponseMeta extends ListMeta {
  name?: string
  sort: FacilityLicenseSorting
}

export class FacilityLicenses extends ModelList<FacilityLicense, FacilityLicenseData, FacilityLicenseListResponseMeta> {
  constructor (facilityLicenses: FacilityLicenseData[], facilityLicensesMeta: FacilityLicenseListResponseMeta, sessionHandler: SessionHandler) {
    super(FacilityLicense, facilityLicenses, facilityLicensesMeta, sessionHandler)
  }
}

export class FacilityLicense extends Model {
  protected _facilityLicenseData: FacilityLicenseData

  constructor (facilityLicenseData: FacilityLicenseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityLicenseData = facilityLicenseData
  }

  private setFacilityLicenseData (facilityLicenseData: FacilityLicenseData) {
    this._facilityLicenseData = facilityLicenseData
  }

  async reload () {
    const { facilityLicense } = await this.action('facilityLicense:show', { id: this.id }) as FacilityLicenseResponse
    this.setFacilityLicenseData(facilityLicense)
    return this
  }

  async delete () {
    await this.action('facilityLicense:delete', { id: this.id })
  }

  ejectData () {
    return this.eject(this._facilityLicenseData)
  }

  get id () {
    return this._facilityLicenseData.id
  }

  get key () {
    return this._facilityLicenseData.key
  }

  get accountId () {
    return this._facilityLicenseData.accountId
  }

  get term () {
    return this._facilityLicenseData.term
  }

  get type () {
    return this._facilityLicenseData.type
  }

  get facilityId () {
    return this._facilityLicenseData.facilityId
  }

  get effectiveDate () {
    return this._facilityLicenseData.effectiveDate !== null ? new Date(this._facilityLicenseData.effectiveDate) : null
  }

  get expiresDate () {
    return this.effectiveDate !== null ? new Date(this.effectiveDate.getTime() + (this.term * msPerDay)) : null
  }

  eagerFacility () {
    return typeof this._facilityLicenseData.facility !== 'undefined' ? new Facility(this._facilityLicenseData.facility, this.sessionHandler) : undefined
  }
}
