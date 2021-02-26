import { ForceUnit } from '../constants'
import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface FacilityStrengthMachineConfigurationData {
  timeZone: string
  forceUnits: ForceUnit
  primaryFocus: string
  secondaryFocus: string
}

export interface FacilityStrengthMachineConfigurationResponse extends AuthenticatedResponse {
  facilityStrengthMachineConfiguration: FacilityStrengthMachineConfigurationData
}

export class FacilityStrengthMachineConfiguration extends Model {
  private _facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData

  constructor (facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityStrengthMachineConfigurationData = facilityStrengthMachineConfigurationData
  }

  private setFacilityStrengthMachineConfiguration (facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData) {
    this._facilityStrengthMachineConfigurationData = facilityStrengthMachineConfigurationData
  }

  async reload () {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:show') as FacilityStrengthMachineConfigurationResponse
    this.setFacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration)
    return this
  }

  async update (params: { timeZone: string, forceUnits: ForceUnit, primaryFocus: string, secondaryFocus: string }) {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:update', params) as FacilityStrengthMachineConfigurationResponse
    this.setFacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration)
    return this
  }

  get timeZone () {
    return this._facilityStrengthMachineConfigurationData.timeZone
  }

  get forceUnits () {
    return this._facilityStrengthMachineConfigurationData.forceUnits
  }

  get primaryFocus () {
    return this._facilityStrengthMachineConfigurationData.primaryFocus
  }

  get secondaryFocus () {
    return this._facilityStrengthMachineConfigurationData.secondaryFocus
  }
}
