import { ListMeta, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { Muscle, MuscleData, MuscleSorting, MuscleTargetLevel } from './muscle'

export interface CardioExerciseMuscleResponse extends AuthenticatedResponse {
  cardioExerciseMuscle: MuscleData
}

export interface CardioExerciseMuscleListResponse extends AuthenticatedResponse {
  cardioExerciseMuscles: MuscleData[]
  cardioExerciseMusclesMeta: CardioExerciseMuscleListResponseMeta
}

export interface CardioExerciseMuscleListResponseMeta extends ListMeta {
  cardioExerciseId?: number
  muscle?: string
  targetLevel?: MuscleTargetLevel
  sort: MuscleSorting
}

export class CardioExerciseMuscles extends ModelList<CardioExerciseMuscle, MuscleData, CardioExerciseMuscleListResponseMeta> {
  constructor (CardioExerciseMuscles: MuscleData[], CardioExerciseMusclesMeta: CardioExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(CardioExerciseMuscle, CardioExerciseMuscles, CardioExerciseMusclesMeta, sessionHandler)
  }
}

export class CardioExerciseMuscle extends Muscle {
  async reload () {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { id: this.id }) as CardioExerciseMuscleResponse
    this.setMuscleData(cardioExerciseMuscle)
    return this
  }
}

/** @hidden */
export class PrivilegedCardioExerciseMuscles extends ModelList<PrivilegedCardioExerciseMuscle, MuscleData, CardioExerciseMuscleListResponseMeta> {
  constructor (cardioExerciseMuscles: MuscleData[], cardioExerciseMusclesMeta: CardioExerciseMuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedCardioExerciseMuscle, cardioExerciseMuscles, cardioExerciseMusclesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedCardioExerciseMuscle extends CardioExerciseMuscle {
  async update (params: { targetLevel: MuscleTargetLevel}) {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:update', { ...params, id: this.id }) as CardioExerciseMuscleResponse
    this.setMuscleData(cardioExerciseMuscle)
    return this
  }

  async delete () {
    await this.action('cardioExerciseMuscle:delete', { id : this.id })
  }
}
