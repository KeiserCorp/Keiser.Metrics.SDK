import { ForceUnit } from '../constants'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface FacilityMachinesConfigurationData {
  timeZone: string
  forceUnits: ForceUnit
  primaryFocus: string
  secondaryFocus: string
}

export interface FacilityMachinesConfigurationResponse extends AuthenticatedResponse {
  facilityMachinesConfiguration: FacilityMachinesConfigurationData
}

export class FacilityMachinesConfiguration extends Model {
  private _facilityMachinesConfigurationData: FacilityMachinesConfigurationData

  constructor (facilityMachinesConfigurationData: FacilityMachinesConfigurationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityMachinesConfigurationData = facilityMachinesConfigurationData
  }

  private setFacilityMachineConfiguration (facilityMachinesConfigurationData: FacilityMachinesConfigurationData) {
    this._facilityMachinesConfigurationData = facilityMachinesConfigurationData
  }

  async reload () {
    const { facilityMachinesConfiguration } = await this.action('facilityMachinesConfiguration:show') as FacilityMachinesConfigurationResponse
    this.setFacilityMachineConfiguration(facilityMachinesConfiguration)
    return this
  }

  async update (params: { timeZone: string, forceUnits: ForceUnit, primaryFocus: string, secondaryFocus: string }) {
    const { facilityMachinesConfiguration } = await this.action('facilityMachinesConfiguration:update', params) as FacilityMachinesConfigurationResponse
    this.setFacilityMachineConfiguration(facilityMachinesConfiguration)
    return this
  }

  get timeZone () {
    return this._facilityMachinesConfigurationData.timeZone
  }

  get forceUnits () {
    return this._facilityMachinesConfigurationData.forceUnits
  }

  get primaryFocus () {
    return this._facilityMachinesConfigurationData.primaryFocus
  }

  get secondaryFocus () {
    return this._facilityMachinesConfigurationData.secondaryFocus
  }
}
