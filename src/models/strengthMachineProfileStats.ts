import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface StrengthMachineProfileStatsData {
  strengthMachineId: number
  peakPower: number
}

export interface StrengthMachineProfileStatsResponse extends AuthenticatedResponse {
  strengthMachineProfileStats: StrengthMachineProfileStatsData
}

export class StrengthMachineProfileStats extends Model {
  private _strengthMachineProfileStatsData: StrengthMachineProfileStatsData

  constructor (strengthMachineProfileStatsData: StrengthMachineProfileStatsData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineProfileStatsData = strengthMachineProfileStatsData
  }

  protected setStrengthMachineProfileStatsData (strengthMachineProfileStatsData: StrengthMachineProfileStatsData) {
    this._strengthMachineProfileStatsData = strengthMachineProfileStatsData
  }

  async reload () {
    const { strengthMachineProfileStats } = await this.action('strengthMachineProfileStats:show', { strengthMachineId: this._strengthMachineProfileStatsData.strengthMachineId }) as StrengthMachineProfileStatsResponse
    this.setStrengthMachineProfileStatsData(strengthMachineProfileStats)
    return this
  }

  ejectData () {
    return this.eject(this._strengthMachineProfileStatsData)
  }

  get peakPower () {
    return this._strengthMachineProfileStatsData.peakPower
  }
}
