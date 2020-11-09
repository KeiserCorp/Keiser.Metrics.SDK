import { ListMeta, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Muscle, MuscleData, MuscleSorting, MuscleTargetLevel } from './muscle'

export interface StrengthExerciseMuscleResponse extends AuthenticatedResponse {
  strengthExerciseMuscle: MuscleData
}

export interface StrengthExerciseMuscleListResponse extends AuthenticatedResponse {
  strengthExerciseMuscles: MuscleData[]
  strengthExerciseMusclesMeta: StrengthExerciseMuscleListResponseMeta
}

export interface StrengthExerciseMuscleListResponseMeta extends ListMeta {
  strengthExerciseId?: number
  muscle?: string
  targetLevel?: MuscleTargetLevel
  sort: MuscleSorting
}

export class StrengthExerciseMuscles extends ModelList<StrengthExerciseMuscle, MuscleData, StrengthExerciseMuscleListResponseMeta> {
  constructor (StrengthExerciseMuscles: MuscleData[], StrengthExerciseMusclesMeta: StrengthExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthExerciseMuscle, StrengthExerciseMuscles, StrengthExerciseMusclesMeta, sessionHandler)
  }
}

export class StrengthExerciseMuscle extends Muscle {
  async reload () {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { id: this.id }) as StrengthExerciseMuscleResponse
    this.setMuscleData(strengthExerciseMuscle)
    return this
  }
}

/** @hidden */
export class PrivilegedStrengthExerciseMuscles extends ModelList<PrivilegedStrengthExerciseMuscle, MuscleData, StrengthExerciseMuscleListResponseMeta> {
  constructor (strengthExerciseMuscles: MuscleData[], strengthExerciseMusclesMeta: StrengthExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStrengthExerciseMuscle, strengthExerciseMuscles, strengthExerciseMusclesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthExerciseMuscle extends StrengthExerciseMuscle {
  async update (params: { targetLevel: MuscleTargetLevel }) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:update', { ...params, id: this.id }) as StrengthExerciseMuscleResponse
    this.setMuscleData(strengthExerciseMuscle)
    return this
  }

  async delete () {
    await this.action('strengthExerciseMuscle:delete', { id : this.id })
  }
}
