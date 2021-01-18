import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioExerciseData } from './cardioExercise'
import { CardioMachineData } from './cardioMachine'
import { MSeriesDataSetData } from './mSeriesDataSet'
import { StrengthExerciseData } from './strengthExercise'
import { StrengthMachineData } from './strengthMachine'
import { ForceUnit, StrengthMachineDataSetData } from './strengthMachineDataSet'

export const enum SessionPlanSetInstanceType {
  Cardio = 'cardio',
  Strength = 'strength',
  Stretch = 'stretch',
  Activity = 'activity'
}
export interface SessionPlanSequenceInstanceData {
  id: number
  name: string
  description: string | null
  notes: string | null
  startedAt: string
  scheduleIndex: number
  sessionPlanSetInstances: SessionPlanSetInstance[]
}

export interface SessionPlanSetInstance {
  id: number
  notes: string | null
  completed: boolean
  type: SessionPlanSetInstanceType
}

export interface SessionPlanCardioSetInstance extends SessionPlanSetInstance {
  targetDuration: number | null
  targetDistance: number | null
  targetCaloricBurn: number | null
  completedDuration: number | null
  completedDistance: number | null
  completedCaloricBurn: number | null
  cardioExercise?: CardioExerciseData
  cardioMachine?: CardioMachineData
  mSeriesDataSet?: MSeriesDataSetData
}

export interface SessionPlanStrengthSetInstance extends SessionPlanSetInstance {
  targetRepetitionCount: number | null
  targetResistance: number | null
  targetForceUnit: ForceUnit | null
  completedRepetitionCount: number | null
  completedResistance: number | null
  completedForceUnit: ForceUnit | null
  strengthExercise?: StrengthExerciseData
  strengthMachine?: StrengthMachineData
  strengthMachineDataSet?: StrengthMachineDataSetData
}

export interface SessionPlanStretchSetInstance extends SessionPlanSetInstance {}
export interface SessionPlanActivitySetInstance extends SessionPlanSetInstance {}

export interface SessionPlanSequenceInstanceResponse extends AuthenticatedResponse {
  sessionPlanSequenceInstance: SessionPlanSequenceInstanceData
}

export class SessionPlanSequenceInstance extends Model {
  private _sessionPlanSequenceData: SessionPlanSequenceInstanceData

  constructor (sessionPlanSequenceData: SessionPlanSequenceInstanceData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._sessionPlanSequenceData = sessionPlanSequenceData
  }

  protected setSessionPlanSequenceData (sessionPlanSequenceData: SessionPlanSequenceInstanceData) {
    this._sessionPlanSequenceData = sessionPlanSequenceData
  }

  async reload () {
    const { sessionPlanSequenceInstance } = await this.action('sessionPlanSequenceInstance:show', { id: this._sessionPlanSequenceData.id }) as SessionPlanSequenceInstanceResponse
    this.setSessionPlanSequenceData(sessionPlanSequenceInstance)
    return this
  }

  get id () {
    return this._sessionPlanSequenceData.id
  }

  get name () {
    return this._sessionPlanSequenceData.name
  }

  get description () {
    return this._sessionPlanSequenceData.description
  }

  get notes () {
    return this._sessionPlanSequenceData.notes
  }

  get startedAt () {
    return new Date(this._sessionPlanSequenceData.startedAt)
  }

  get scheduleIndex () {
    return this._sessionPlanSequenceData.scheduleIndex
  }

  get sessionPlanSetInstances () {
    return this._sessionPlanSequenceData.sessionPlanSetInstances
  }
}
