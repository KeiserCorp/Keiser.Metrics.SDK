import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Facility, FacilityData } from './facility'
const msPerDay = 86400000

export enum LicenseType {
  Normal = 'normal',
  Demo = 'demo',
  Test = 'test'
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
    const { facilityLicense } = await this.action('facilityLicense:show', { id : this.id }) as FacilityLicenseResponse
    this.setFacilityLicenseData(facilityLicense)
    return this
  }

  async delete () {
    await this.action('facilityLicense:delete', { id : this.id })
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
    return this._facilityLicenseData.effectiveDate ? new Date(this._facilityLicenseData.effectiveDate) : null
  }

  get expiresDate () {
    return this.effectiveDate ? new Date(this.effectiveDate.getTime() + (this.term * msPerDay)) : null
  }

  get facility () {
    return this._facilityLicenseData.facility ? new Facility(this._facilityLicenseData.facility, this.sessionHandler) : undefined
  }
}

export class FacilityLicenses extends Model {
  async getFacilityLicenses (options: {key?: string, type?: LicenseType, accountId?: string} = {}) {
    const { facilityLicenses } = await this.action('facilityLicense:list', options) as FacilityLicenseListResponse
    return facilityLicenses.map(facilityLicense => new FacilityLicense(facilityLicense, this.sessionHandler))
  }

  async createFacilityLicense (params: {accountId?: string, term: number, type: LicenseType, name?: string, email?: string}) {
    const { facilityLicense } = await this.action('facilityLicense:create', params) as FacilityLicenseResponse
    return new FacilityLicense(facilityLicense, this.sessionHandler)
  }
}
