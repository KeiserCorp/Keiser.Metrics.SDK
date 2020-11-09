import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentData, ExerciseOrdinalSetAssignmentListResponse, ExerciseOrdinalSetAssignmentResponse, ExerciseOrdinalSetAssignments, ExerciseOrdinalSetAssignmentSorting, PrivilegedExerciseOrdinalSetAssignment, PrivilegedExerciseOrdinalSetAssignments } from './exerciseOrdinalSetAssignment'

export interface ExerciseOrdinalSetData {
  id: number
  code: string
  name: string
  description: string
  exerciseOrdinalSetAssignments?: ExerciseOrdinalSetAssignmentData[]
}

export const enum ExerciseOrdinalSetSorting {
  ID = 'id',
  Name = 'name',
  Code = 'code'
}

export interface ExerciseOrdinalSetResponse extends AuthenticatedResponse {
  exerciseOrdinalSet: ExerciseOrdinalSetData
}

export interface ExerciseOrdinalSetListResponse extends AuthenticatedResponse {
  exerciseOrdinalSets: ExerciseOrdinalSetData[]
  exerciseOrdinalSetsMeta: ExerciseOrdinalSetListResponseMeta
}

export interface ExerciseOrdinalSetListResponseMeta extends ListMeta {
  code?: string
  name?: string
  sort: ExerciseOrdinalSetSorting
}

export class ExerciseOrdinalSets extends ModelList<ExerciseOrdinalSet, ExerciseOrdinalSetData, ExerciseOrdinalSetListResponseMeta> {
  constructor (ExerciseOrdinalSets: ExerciseOrdinalSetData[], ExerciseOrdinalSetsMeta: ExerciseOrdinalSetListResponseMeta, sessionHandler: SessionHandler) {
    super(ExerciseOrdinalSet, ExerciseOrdinalSets, ExerciseOrdinalSetsMeta, sessionHandler)
  }
}

export class ExerciseOrdinalSet extends Model {
  protected _exerciseOrdinalSetData: ExerciseOrdinalSetData

  constructor (exerciseOrdinalSetData: ExerciseOrdinalSetData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._exerciseOrdinalSetData = exerciseOrdinalSetData
  }

  protected setExerciseOrdinalSet (exerciseOrdinalSetData: ExerciseOrdinalSetData) {
    this._exerciseOrdinalSetData = exerciseOrdinalSetData
  }

  async reload () {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:show', { id: this.id }) as ExerciseOrdinalSetResponse
    this.setExerciseOrdinalSet(exerciseOrdinalSet)
    return this
  }

  get id () {
    return this._exerciseOrdinalSetData.id
  }

  get code () {
    return this._exerciseOrdinalSetData.code
  }

  get name () {
    return this._exerciseOrdinalSetData.name
  }

  get description () {
    return this._exerciseOrdinalSetData.description
  }

  eagerExerciseOrdinalSetAssignments () {
    return this._exerciseOrdinalSetData.exerciseOrdinalSetAssignments ? this._exerciseOrdinalSetData.exerciseOrdinalSetAssignments.map(exerciseOrdinalSetAssignment => new ExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)) : undefined
  }

  async getExerciseOrdinalSetAssignments (options: { ordinalIdentifier?: string, sort?: ExerciseOrdinalSetAssignmentSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseOrdinalSetAssignments, exerciseOrdinalSetAssignmentsMeta } = await this.action('exerciseOrdinalSetAssignment:list', { ...options, exerciseOrdinalSetId: this.id }) as ExerciseOrdinalSetAssignmentListResponse
    return new ExerciseOrdinalSetAssignments(exerciseOrdinalSetAssignments, exerciseOrdinalSetAssignmentsMeta, this.sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseOrdinalSets extends ModelList<PrivilegedExerciseOrdinalSet, ExerciseOrdinalSetData, ExerciseOrdinalSetListResponseMeta> {
  constructor (exerciseOrdinalSets: ExerciseOrdinalSetData[], exerciseOrdinalSetsMeta: ExerciseOrdinalSetListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedExerciseOrdinalSet, exerciseOrdinalSets, exerciseOrdinalSetsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedExerciseOrdinalSet extends ExerciseOrdinalSet {
  async update (params: { name: string, description: string }) {
    const { exerciseOrdinalSet } = await this.action('exerciseOrdinalSet:update', { ...params, id: this.id }) as ExerciseOrdinalSetResponse
    this.setExerciseOrdinalSet(exerciseOrdinalSet)
    return this
  }

  async delete () {
    await this.action('exerciseOrdinalSet:delete', { id : this.id })
  }

  async getExerciseOrdinalSetAssignments (options: { ordinalIdentifier?: string, sort?: ExerciseOrdinalSetAssignmentSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseOrdinalSetAssignments, exerciseOrdinalSetAssignmentsMeta } = await this.action('exerciseOrdinalSetAssignment:list', { ...options, exerciseOrdinalSetId: this.id }) as ExerciseOrdinalSetAssignmentListResponse
    return new PrivilegedExerciseOrdinalSetAssignments(exerciseOrdinalSetAssignments, exerciseOrdinalSetAssignmentsMeta, this.sessionHandler)
  }

  async createExerciseOrdinalSetAssignment (params: { ordinalIdentifier: string, strengthExerciseVariantId?: number, cardioExerciseVariantId?: number, stretchExerciseVariantId?: number }) {
    const { exerciseOrdinalSetAssignment } = await this.action('exerciseOrdinalSetAssignment:create', { ...params, exerciseOrdinalSetId: this.id }) as ExerciseOrdinalSetAssignmentResponse
    return new PrivilegedExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)
  }
}
