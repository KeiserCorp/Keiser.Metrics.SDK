import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentData } from './exerciseOrdinalSetAssignment'
import { StretchExercise, StretchExerciseData } from './stretchExercise'

export const enum StretchExerciseVariantType {
  Normal = 'normal'
}

export const enum StretchExerciseVariantSorting {
  ID = 'id',
  Variant = 'variant'
}

export interface StretchExerciseVariantData {
  id: number
  variant: StretchExerciseVariantType
  instructionalImage: string | null
  instructionalVideo: string | null
  stretchExercise?: StretchExerciseData
  exerciseOrdinalSetAssignments?: ExerciseOrdinalSetAssignmentData[]
}

export interface StretchExerciseVariantResponse extends AuthenticatedResponse {
  stretchExerciseVariant: StretchExerciseVariantData
}

export interface StretchExerciseVariantListResponse extends AuthenticatedResponse {
  stretchExerciseVariants: StretchExerciseVariantData[]
  stretchExerciseVariantsMeta: StretchExerciseVariantListResponseMeta
}

export interface StretchExerciseVariantListResponseMeta extends ListMeta {
  stretchExerciseId?: number
  stretchMachineId?: number
  variant?: string
  sort: StretchExerciseVariantSorting
}

export class StretchExerciseVariants extends ModelList<StretchExerciseVariant, StretchExerciseVariantData, StretchExerciseVariantListResponseMeta> {
  constructor (StretchExerciseVariants: StretchExerciseVariantData[], StretchExerciseVariantsMeta: StretchExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(StretchExerciseVariant, StretchExerciseVariants, StretchExerciseVariantsMeta, sessionHandler)
  }
}

export class StretchExerciseVariant extends Model {
  protected _stretchExerciseVariantData: StretchExerciseVariantData

  constructor (stretchExerciseVariantData: StretchExerciseVariantData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._stretchExerciseVariantData = stretchExerciseVariantData
  }

  protected setStretchExerciseVariant (stretchExerciseVariantData: StretchExerciseVariantData) {
    this._stretchExerciseVariantData = stretchExerciseVariantData
  }

  async reload () {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:show', { id: this.id }) as StretchExerciseVariantResponse
    this.setStretchExerciseVariant(stretchExerciseVariant)
    return this
  }

  get id () {
    return this._stretchExerciseVariantData.id
  }

  get variant () {
    return this._stretchExerciseVariantData.variant
  }

  get instructionalImage () {
    return this._stretchExerciseVariantData.instructionalImage
  }

  get instructionalVideo () {
    return this._stretchExerciseVariantData.instructionalVideo
  }

  eagerStretchExercise () {
    return typeof this._stretchExerciseVariantData.stretchExercise !== 'undefined' ? new StretchExercise(this._stretchExerciseVariantData.stretchExercise, this.sessionHandler) : undefined
  }

  eagerExerciseOrdinalSetAssignments () {
    return typeof this._stretchExerciseVariantData.exerciseOrdinalSetAssignments !== 'undefined' ? this._stretchExerciseVariantData.exerciseOrdinalSetAssignments.map(exerciseOrdinalSetAssignment => new ExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)) : undefined
  }
}

/** @hidden */
export class PrivilegedStretchExerciseVariants extends ModelList<PrivilegedStretchExerciseVariant, StretchExerciseVariantData, StretchExerciseVariantListResponseMeta> {
  constructor (stretchExerciseVariants: StretchExerciseVariantData[], stretchExerciseVariantsMeta: StretchExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStretchExerciseVariant, stretchExerciseVariants, stretchExerciseVariantsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStretchExerciseVariant extends StretchExerciseVariant {
  async update (params: { variant: StretchExerciseVariantType, instructionalImage?: string | null, instructionalVideo?: string | null }) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:update', { ...params, id: this.id }) as StretchExerciseVariantResponse
    this.setStretchExerciseVariant(stretchExerciseVariant)
    return this
  }

  async delete () {
    await this.action('stretchExerciseVariant:delete', { id: this.id })
  }
}
