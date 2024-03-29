import { ReportGrouping, Units, XOR } from '../constants'
import { ListMeta, ModelList, SubscribableModel } from '../model'
import { AuthenticatedResponse, FacilityKioskTokenResponse, KioskSession, SessionHandler } from '../session'
import { FacilityAccessControl, FacilityAccessControlResponse } from './facilityAccessControl'
import { FacilityConfiguration, FacilityConfigurationResponse } from './facilityConfiguration'
import { FacilityLicenseData } from './facilityLicense'
import { FacilityProfile, FacilityProfileData, PrivilegedFacilityProfile } from './facilityProfile'
import { FacilityEmployeeRole, FacilityRelationshipResponse, FacilityUserEmployeeRelationship, FacilityUserEmployeeRelationships, FacilityUserMemberRelationship, FacilityUserMemberRelationships, FacilityUserRelationship, FacilityUserRelationshipListResponse, FacilityUserRelationships, FacilityUserRelationshipSorting } from './facilityRelationship'
import { FacilityRelationshipRequest, FacilityRelationshipRequestResponse, PrivilegedFacilityRelationshipRequest, PrivilegedFacilityRelationshipRequestListResponse, PrivilegedFacilityRelationshipRequests, PrivilegedFacilityRelationshipRequestSorting } from './facilityRelationshipRequest'
import { FacilityStrengthMachine, FacilityStrengthMachineBulkCreateResponse, FacilityStrengthMachineInitializerOTPTokenResponse, FacilityStrengthMachineInitializerTokenResponse, FacilityStrengthMachineListResponse, FacilityStrengthMachineResponse, FacilityStrengthMachines, FacilityStrengthMachineSorting } from './facilityStrengthMachine'
import { FacilityStrengthMachineConfiguration, FacilityStrengthMachineConfigurationResponse } from './facilityStrengthMachineConfiguration'
import { MachineInitializerOTPToken, MachineInitializerToken } from './machineInitializerToken'
import { Gender } from './profile'
import { FacilitySession, FacilitySessionListResponse, FacilitySessions, SessionResponse, SessionSorting } from './session'

export enum FacilitySorting {
  ID = 'id',
  Name = 'name'
}

export interface FacilityData {
  id: number
  licensedUntil: string
  facilityProfile?: FacilityProfileData
  facilityConfiguration?: any
  facilityLicenses?: FacilityLicenseData
}

export interface FacilityResponse extends AuthenticatedResponse {
  facility: FacilityData
}

export interface FacilityListResponse extends AuthenticatedResponse {
  facilities: FacilityData[]
  facilitiesMeta: FacilityListResponseMeta
}

export interface FacilityListResponseMeta extends ListMeta {
  name?: string
  phone?: string
  address?: string
  city?: string
  postcode?: string
  state?: string
  country?: string
  sort: FacilitySorting
}

export class Facilities extends ModelList<Facility, FacilityData, FacilityListResponseMeta> {
  constructor (facilities: FacilityData[], facilitiesMeta: FacilityListResponseMeta, sessionHandler: SessionHandler) {
    super(Facility, facilities, facilitiesMeta, sessionHandler)
  }
}

export class Facility<SessionHandlerType extends SessionHandler = SessionHandler> extends SubscribableModel<SessionHandlerType> {
  protected _facilityData: FacilityData

  constructor (facilityData: FacilityData, sessionHandler: SessionHandlerType) {
    super(sessionHandler)
    this._facilityData = facilityData
  }

  protected get subscribeParameters () {
    return { model: 'facility', id: this.id }
  }

  protected setFacilityData (facilityData: FacilityData) {
    this._facilityData = facilityData
  }

  async reload () {
    const { facility } = await this.action('facility:show', { id: this._facilityData.id }) as FacilityResponse
    this.setFacilityData(facility)
    return this
  }

  ejectData () {
    return this.eject(this._facilityData)
  }

  get id () {
    return this._facilityData.id
  }

  eagerFacilityProfile (): FacilityProfile | undefined {
    return typeof this._facilityData.facilityProfile !== 'undefined' ? new FacilityProfile(this._facilityData.facilityProfile, this, this.sessionHandler) : undefined
  }

  async createUserInitiatedRelationshipRequest (params: { memberIdentifier?: string }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:userCreate', { ...params, facilityId: this.id }) as FacilityRelationshipRequestResponse
    return new FacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
  }
}

export class PrivilegedFacility extends Facility {
  get licensedUntil () {
    return new Date(this._facilityData.licensedUntil)
  }

  get isActive () {
    return this.id === this.sessionHandler.decodedAccessToken?.facility?.id
  }

  eagerFacilityProfile () {
    return typeof this._facilityData.facilityProfile !== 'undefined' ? new PrivilegedFacilityProfile(this._facilityData.facilityProfile, this, this.sessionHandler) : undefined
  }

  async setActive () {
    await this.action('auth:setFacility', { facilityId: this.id, refreshable: this.sessionHandler.refreshToken !== null })
  }

  async createKioskSession () {
    const response = await this.action('facilityKioskToken:create') as FacilityKioskTokenResponse
    return new KioskSession({ accessToken: response.kioskToken }, this.sessionHandler.connection)
  }

  async createFacilityMemberUser (params: { email: string, name: string, birthday?: Date, gender?: Gender, language?: string, units?: Units, memberIdentifier?: string, memberSecret?: string, employeeRole?: string | null }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityCreate', { ...params, member: true }) as FacilityRelationshipResponse
    return new FacilityUserMemberRelationship(facilityRelationship, this.sessionHandler)
  }

  async createFacilityEmployeeUser (params: { email: string, name: string, birthday?: Date, gender?: Gender, language?: string, units?: Units, member?: boolean, memberIdentifier?: string, memberSecret?: string, employeeRole: string }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityCreate', params) as FacilityRelationshipResponse
    return new FacilityUserEmployeeRelationship(facilityRelationship, this.sessionHandler)
  }

  async createFacilityInitiatedRelationshipRequest (params: { email: string, member?: boolean, memberIdentifier?: string, employeeRole?: FacilityEmployeeRole | null }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:facilityCreate', params) as FacilityRelationshipRequestResponse
    return new PrivilegedFacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
  }

  async getRelationshipRequest (params: { id: number }) {
    const { facilityRelationshipRequest } = await this.action('facilityRelationshipRequest:facilityShow', params) as FacilityRelationshipRequestResponse
    return new PrivilegedFacilityRelationshipRequest(facilityRelationshipRequest, this.sessionHandler)
  }

  async getRelationshipRequests (options: { memberIdentifier?: string, name?: string, sort?: PrivilegedFacilityRelationshipRequestSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationshipRequests, facilityRelationshipRequestsMeta } = await this.action('facilityRelationshipRequest:facilityList', options) as PrivilegedFacilityRelationshipRequestListResponse
    return new PrivilegedFacilityRelationshipRequests(facilityRelationshipRequests, facilityRelationshipRequestsMeta, this.sessionHandler)
  }

  async getRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { ...params }) as FacilityRelationshipResponse
    return new FacilityUserRelationship(facilityRelationship, this.sessionHandler)
  }

  async getRelationships (options: { name?: string, member?: boolean, employee?: boolean, memberIdentifier?: string, includeSession?: boolean, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getMemberRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { ...params }) as FacilityRelationshipResponse
    return new FacilityUserMemberRelationship(facilityRelationship, this.sessionHandler)
  }

  async getMemberRelationships (options: { name?: string, memberIdentifier?: string, includeSession?: boolean, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, member: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserMemberRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getEmployeeRelationship (params: { id: number }) {
    const { facilityRelationship } = await this.action('facilityRelationship:facilityShow', { ...params }) as FacilityRelationshipResponse
    return new FacilityUserEmployeeRelationship(facilityRelationship, this.sessionHandler)
  }

  async getEmployeeRelationships (options: { name?: string, employeeRole?: FacilityEmployeeRole | null, sort?: FacilityUserRelationshipSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityRelationships, facilityRelationshipsMeta } = await this.action('facilityRelationship:facilityList', { ...options, employee: true }) as FacilityUserRelationshipListResponse
    return new FacilityUserEmployeeRelationships(facilityRelationships, facilityRelationshipsMeta, this.sessionHandler)
  }

  async getSession (params: XOR<{ id: number }, { echipId: string }>) {
    const { session } = await this.action('facilitySession:show', params) as SessionResponse
    return new FacilitySession(session, this.sessionHandler)
  }

  async getSessions (options: { open?: boolean, name?: string, from?: Date, to?: Date, sort?: SessionSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { sessions, sessionsMeta } = await this.action('facilitySession:list', options) as FacilitySessionListResponse
    return new FacilitySessions(sessions, sessionsMeta, this.sessionHandler)
  }

  async createFacilityStrengthMachine (params: { strengthMachineId: number, model: string, version: string, serial: string, location?: string }) {
    const { facilityStrengthMachine } = await this.action('facilityStrengthMachine:create', { ...params }) as FacilityStrengthMachineResponse
    return new FacilityStrengthMachine(facilityStrengthMachine, this.sessionHandler)
  }

  async createFacilityStrengthMachinesFromEChip (params: { echipData: any }) {
    const { facilityStrengthMachines, unknownMachines } = await this.action('facilityStrengthMachine:createEchip', { echipData: JSON.stringify(params.echipData) }) as FacilityStrengthMachineBulkCreateResponse
    return {
      strengthMachines: facilityStrengthMachines.map(f => new FacilityStrengthMachine(f, this.sessionHandler)),
      unknownMachines
    }
  }

  async getFacilityStrengthMachine (params: { id: number }) {
    const { facilityStrengthMachine } = await this.action('facilityStrengthMachine:show', params) as FacilityStrengthMachineResponse
    return new FacilityStrengthMachine(facilityStrengthMachine, this.sessionHandler)
  }

  async getFacilityStrengthMachines (options: { model?: string, sort?: FacilityStrengthMachineSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { facilityStrengthMachines, facilityStrengthMachinesMeta } = await this.action('facilityStrengthMachine:list', { ...options, member: true }) as FacilityStrengthMachineListResponse
    return new FacilityStrengthMachines(facilityStrengthMachines, facilityStrengthMachinesMeta, this.sessionHandler)
  }

  async getAccessControl () {
    const { facilityAccessControl } = await this.action('facilityAccessControl:show') as FacilityAccessControlResponse
    return new FacilityAccessControl(facilityAccessControl, this.sessionHandler)
  }

  async getConfiguration () {
    const { facilityConfiguration } = await this.action('facilityConfiguration:show') as FacilityConfigurationResponse
    return new FacilityConfiguration(facilityConfiguration, this.sessionHandler)
  }

  async getFacilityStrengthMachineConfiguration () {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:show') as FacilityStrengthMachineConfigurationResponse
    return new FacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration, this.sessionHandler)
  }

  async getFacilityStrengthMachineInitializerJWTToken () {
    const response = await this.action('facilityStrengthMachine:initializerToken') as FacilityStrengthMachineInitializerTokenResponse
    return new MachineInitializerToken(response)
  }

  async getFacilityStrengthMachineInitializerOTPToken () {
    const response = await this.action('facilityStrengthMachine:initializerOTP') as FacilityStrengthMachineInitializerOTPTokenResponse
    return new MachineInitializerOTPToken(response)
  }

  async applyLicense (params: { key: string}) {
    const response = await this.action('facility:applyLicense', params) as FacilityResponse
    this.setFacilityData(response.facility)
    return this
  }

  getExportCsv (params: { from: Date, to: Date}) {
    // await this.action('strengthMachineDataSet:exportCsv', { ...params })
    const url = new URL(this.sessionHandler.connection.baseUrl.toString() + `/api?action=strengthMachineDataSet:exportCsv&from=${params.from.toUTCString()}&to=${params.to.toUTCString()}`)
    url.searchParams.append('authorization', this.sessionHandler.accessToken)
    return url.toString()
  }

  getFacilityReportCheckIn (params: { from: Date, to: Date, group: ReportGrouping}) {
    const url = new URL(this.sessionHandler.connection.baseUrl.toString() + `/api?action=facilityReport:checkIn&from=${params.from.toUTCString()}&to=${params.to.toUTCString()}&group=${params.group}`)
    url.searchParams.append('authorization', this.sessionHandler.accessToken)
    return url.toString()
  }
}
