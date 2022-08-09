import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export interface StrengthMachineProfileStatsMeta {
  strengthMachineId: number
}

export interface StrengthMachineProfileStatsData {
  peakPower: number
}

export interface StrengthMachineProfileStatsResponse extends AuthenticatedResponse {
  strengthMachineProfileStats: StrengthMachineProfileStatsData
}

export class StrengthMachineProfileStats extends Model {
  private _strengthMachineProfileStatsData: StrengthMachineProfileStatsData
  private readonly _strengthMachineProfileStatsMeta: StrengthMachineProfileStatsMeta

  constructor (strengthMachineProfileStatsData: StrengthMachineProfileStatsData, strengthMachineProfileStatsMeta: StrengthMachineProfileStatsMeta, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthMachineProfileStatsData = strengthMachineProfileStatsData
    this._strengthMachineProfileStatsMeta = strengthMachineProfileStatsMeta
  }

  protected setStrengthMachineProfileStatsData (strengthMachineProfileStatsData: StrengthMachineProfileStatsData) {
    this._strengthMachineProfileStatsData = strengthMachineProfileStatsData
  }

  async reload () {
    const { strengthMachineProfileStats } = await this.action('strengthMachineProfileStats:show', { strengthMachineId: this._strengthMachineProfileStatsMeta.strengthMachineId }) as StrengthMachineProfileStatsResponse
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
