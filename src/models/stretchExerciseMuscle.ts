import { ListMeta, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Muscle, MuscleData, MuscleSorting, MuscleTargetLevel } from './muscle'

export interface StretchExerciseMuscleResponse extends AuthenticatedResponse {
  stretchExerciseMuscle: MuscleData
}

export interface StretchExerciseMuscleListResponse extends AuthenticatedResponse {
  stretchExerciseMuscles: MuscleData[]
  stretchExerciseMusclesMeta: StretchExerciseMuscleListResponseMeta
}

export interface StretchExerciseMuscleListResponseMeta extends ListMeta {
  stretchExerciseId?: number
  muscle?: string
  targetLevel?: MuscleTargetLevel
  sort: MuscleSorting
}

export class StretchExerciseMuscles extends ModelList<StretchExerciseMuscle, MuscleData, StretchExerciseMuscleListResponseMeta> {
  constructor (StretchExerciseMuscles: MuscleData[], StretchExerciseMusclesMeta: StretchExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(StretchExerciseMuscle, StretchExerciseMuscles, StretchExerciseMusclesMeta, sessionHandler)
  }
}

export class StretchExerciseMuscle extends Muscle {
  async reload () {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { id: this.id }) as StretchExerciseMuscleResponse
    this.setMuscleData(stretchExerciseMuscle)
    return this
  }
}

/** @hidden */
export class PrivilegedStretchExerciseMuscles extends ModelList<PrivilegedStretchExerciseMuscle, MuscleData, StretchExerciseMuscleListResponseMeta> {
  constructor (stretchExerciseMuscles: MuscleData[], stretchExerciseMusclesMeta: StretchExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStretchExerciseMuscle, stretchExerciseMuscles, stretchExerciseMusclesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStretchExerciseMuscle extends StretchExerciseMuscle {
  async update (params: { targetLevel: MuscleTargetLevel }) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:update', { ...params, id: this.id }) as StretchExerciseMuscleResponse
    this.setMuscleData(stretchExerciseMuscle)
    return this
  }

  async delete () {
    await this.action('stretchExerciseMuscle:delete', { id: this.id })
  }
}
