import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { CardioExerciseVariant, CardioExerciseVariantData } from './cardioExerciseVariant'
import { ExerciseOrdinalSet, ExerciseOrdinalSetData } from './exerciseOrdinalSet'
import { StrengthExerciseVariant, StrengthExerciseVariantData } from './strengthExerciseVariant'
import { StretchExerciseVariant, StretchExerciseVariantData } from './stretchExerciseVariant'

export interface ExerciseOrdinalSetAssignmentData {
  id: number
  ordinalIdentifier: string
  exerciseOrdinalSet: ExerciseOrdinalSetData
  strengthExerciseVariant?: StrengthExerciseVariantData
  cardioExerciseVariant?: CardioExerciseVariantData
  stretchExerciseVariant?: StretchExerciseVariantData
}

export const enum ExerciseOrdinalSetAssignmentSorting {
  ID = 'id',
  OrdinalIdentifier = 'ordinalIdentifier'
}

export interface ExerciseOrdinalSetAssignmentResponse extends AuthenticatedResponse {
  exerciseOrdinalSetAssignment: ExerciseOrdinalSetAssignmentData
}

export interface ExerciseOrdinalSetAssignmentListResponse extends AuthenticatedResponse {
  exerciseOrdinalSetAssignments: ExerciseOrdinalSetAssignmentData[]
  exerciseOrdinalSetAssignmentsMeta: ExerciseOrdinalSetAssignmentListResponseMeta
}

export interface ExerciseOrdinalSetAssignmentListResponseMeta extends ListMeta {
  exerciseOrdinalSetId?: number
  ordinalIdentifier?: string
  sort: ExerciseOrdinalSetAssignmentSorting
}

export class ExerciseOrdinalSetAssignments extends ModelList<ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentData, ExerciseOrdinalSetAssignmentListResponseMeta> {
  constructor (ExerciseOrdinalSetAssignments: ExerciseOrdinalSetAssignmentData[], ExerciseOrdinalSetAssignmentsMeta: ExerciseOrdinalSetAssignmentListResponseMeta, sessionHandler: SessionHandler) {
    super(ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignments, ExerciseOrdinalSetAssignmentsMeta, sessionHandler)
  }
}

export class ExerciseOrdinalSetAssignment extends Model {
  protected _exerciseOrdinalSetAssignmentData: ExerciseOrdinalSetAssignmentData

  constructor (exerciseOrdinalSetAssignmentData: ExerciseOrdinalSetAssignmentData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._exerciseOrdinalSetAssignmentData = exerciseOrdinalSetAssignmentData
  }

  protected setExerciseOrdinalSetAssignment (exerciseOrdinalSetAssignmentData: ExerciseOrdinalSetAssignmentData) {
    this._exerciseOrdinalSetAssignmentData = exerciseOrdinalSetAssignmentData
  }

  async reload () {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:show', { id: this.id }) as ExerciseOrdinalSetAssignmentResponse
    this.setExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment)
    return this
  }

  get id () {
    return this._exerciseOrdinalSetAssignmentData.id
  }

  get ordinalIdentifier () {
    return this._exerciseOrdinalSetAssignmentData.ordinalIdentifier
  }

  get exerciseOrdinalSet () {
    return this._exerciseOrdinalSetAssignmentData.exerciseOrdinalSet ? new ExerciseOrdinalSet(this._exerciseOrdinalSetAssignmentData.exerciseOrdinalSet, this.sessionHandler) : undefined
  }

  get strengthExerciseVariant () {
    return this._exerciseOrdinalSetAssignmentData.strengthExerciseVariant ? new StrengthExerciseVariant(this._exerciseOrdinalSetAssignmentData.strengthExerciseVariant, this.sessionHandler) : undefined
  }

  get cardioExerciseVariant () {
    return this._exerciseOrdinalSetAssignmentData.cardioExerciseVariant ? new CardioExerciseVariant(this._exerciseOrdinalSetAssignmentData.cardioExerciseVariant, this.sessionHandler) : undefined
  }

  get stretchExerciseVariant () {
    return this._exerciseOrdinalSetAssignmentData.stretchExerciseVariant ? new StretchExerciseVariant(this._exerciseOrdinalSetAssignmentData.stretchExerciseVariant, this.sessionHandler) : undefined
  }
}

/** @hidden */
export class PrivilegedExerciseOrdinalSetAssignments extends ModelList<PrivilegedExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentData, ExerciseOrdinalSetAssignmentListResponseMeta> {
  constructor (exerciseOrdinalSetAssignments: ExerciseOrdinalSetAssignmentData[], exerciseOrdinalSetAssignmentsMeta: ExerciseOrdinalSetAssignmentListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExerciseOrdinalSetAssignment, exerciseOrdinalSetAssignments, exerciseOrdinalSetAssignmentsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseOrdinalSetAssignment extends ExerciseOrdinalSetAssignment {
  async delete () {
    await this.action('exerciseOrdinalSetAssignment:delete', { id : this.id })
  }
}
