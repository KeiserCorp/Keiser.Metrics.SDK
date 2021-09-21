import { ForceUnit } from '../constants'
import { SubscribableModel } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface FacilityStrengthMachineConfigurationData {
  facilityId: number
  timeZone: string
  forceUnit: ForceUnit
  primaryFocus: string
  secondaryFocus: string
  locale: string
}

export interface FacilityStrengthMachineConfigurationResponse extends AuthenticatedResponse {
  facilityStrengthMachineConfiguration: FacilityStrengthMachineConfigurationData
}

export class FacilityStrengthMachineConfiguration extends SubscribableModel {
  private _facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData

  constructor (facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._facilityStrengthMachineConfigurationData = facilityStrengthMachineConfigurationData
  }

  private setFacilityStrengthMachineConfiguration (facilityStrengthMachineConfigurationData: FacilityStrengthMachineConfigurationData) {
    this._facilityStrengthMachineConfigurationData = facilityStrengthMachineConfigurationData
  }

  protected get subscribeParameters () {
    return { model: 'facilityStrengthMachineConfiguration', id: this._facilityStrengthMachineConfigurationData.facilityId }
  }

  async reload () {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:show') as FacilityStrengthMachineConfigurationResponse
    this.setFacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration)
    return this
  }

  async update (params: { timeZone: string, forceUnit: ForceUnit, primaryFocus: string, secondaryFocus: string, locale: string }) {
    const { facilityStrengthMachineConfiguration } = await this.action('facilityStrengthMachineConfiguration:update', params) as FacilityStrengthMachineConfigurationResponse
    this.setFacilityStrengthMachineConfiguration(facilityStrengthMachineConfiguration)
    return this
  }

  get timeZone () {
    return this._facilityStrengthMachineConfigurationData.timeZone
  }

  get forceUnit () {
    return this._facilityStrengthMachineConfigurationData.forceUnit
  }

  get primaryFocus () {
    return this._facilityStrengthMachineConfigurationData.primaryFocus
  }

  get secondaryFocus () {
    return this._facilityStrengthMachineConfigurationData.secondaryFocus
  }

  get locale () {
    return this._facilityStrengthMachineConfigurationData.locale
  }
}