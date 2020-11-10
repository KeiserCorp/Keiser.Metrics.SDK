import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseOrdinalSetAssignment, ExerciseOrdinalSetAssignmentData } from './exerciseOrdinalSetAssignment'
import { StrengthExercise, StrengthExerciseData } from './strengthExercise'
import { StrengthMachine, StrengthMachineData } from './strengthMachine'

export const enum StrengthExerciseVariantType {
  Normal = 'normal',
  SingleArm = 'singleArm',
  SingleLeg = 'singleLeg',
  SingleArmSingleLeg = 'singleArmSingleLeg',
  DoubleArmSingleLeg = 'doubleArmSingleLeg',
  Alternate = 'alternate'
}

export const enum StrengthExerciseVariantAttachment {
  Bar = 'bar',
  Rope = 'rope',
  SingleHandles = 'singleHandles',
  DoubleHandles = 'doubleHandles',
  AnkleStrap = 'ankleStrap',
  ThighStrap = 'thighStrap',
  Belt = 'belt'
}

export const enum StrengthExerciseVariantSorting {
  ID = 'id',
  Variant = 'variant',
  Attachment = 'attachment'
}

export interface StrengthExerciseVariantData {
  id: number
  variant: StrengthExerciseVariantType
  attachment: StrengthExerciseVariantAttachment | null
  instructionalImage: string | null
  instructionalVideo: string | null
  strengthExercise?: StrengthExerciseData
  strengthMachine?: StrengthMachineData
  exerciseOrdinalSetAssignments?: ExerciseOrdinalSetAssignmentData[]
}

export interface StrengthExerciseVariantResponse extends AuthenticatedResponse {
  strengthExerciseVariant: StrengthExerciseVariantData
}

export interface StrengthExerciseVariantListResponse extends AuthenticatedResponse {
  strengthExerciseVariants: StrengthExerciseVariantData[]
  strengthExerciseVariantsMeta: StrengthExerciseVariantListResponseMeta
}

export interface StrengthExerciseVariantListResponseMeta extends ListMeta {
  strengthExerciseId?: number
  strengthMachineId?: number
  variant?: string
  attachment?: string
  sort: StrengthExerciseVariantSorting
}

export class StrengthExerciseVariants extends ModelList<StrengthExerciseVariant, StrengthExerciseVariantData, StrengthExerciseVariantListResponseMeta> {
  constructor (StrengthExerciseVariants: StrengthExerciseVariantData[], StrengthExerciseVariantsMeta: StrengthExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthExerciseVariant, StrengthExerciseVariants, StrengthExerciseVariantsMeta, sessionHandler)
  }
}

export class StrengthExerciseVariant extends Model {
  protected _strengthExerciseVariantData: StrengthExerciseVariantData

  constructor (strengthExerciseVariantData: StrengthExerciseVariantData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthExerciseVariantData = strengthExerciseVariantData
  }

  protected setStrengthExerciseVariant (strengthExerciseVariantData: StrengthExerciseVariantData) {
    this._strengthExerciseVariantData = strengthExerciseVariantData
  }

  async reload () {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:show', { id: this.id }) as StrengthExerciseVariantResponse
    this.setStrengthExerciseVariant(strengthExerciseVariant)
    return this
  }

  get id () {
    return this._strengthExerciseVariantData.id
  }

  get variant () {
    return this._strengthExerciseVariantData.variant
  }

  get attachment () {
    return this._strengthExerciseVariantData.attachment
  }

  get instructionalImage () {
    return this._strengthExerciseVariantData.instructionalImage
  }

  get instructionalVideo () {
    return this._strengthExerciseVariantData.instructionalVideo
  }

  eagerStrengthExercise () {
    return typeof this._strengthExerciseVariantData.strengthExercise !== 'undefined' ? new StrengthExercise(this._strengthExerciseVariantData.strengthExercise, this.sessionHandler) : undefined
  }

  eagerStrengthMachine () {
    return typeof this._strengthExerciseVariantData.strengthMachine !== 'undefined' ? new StrengthMachine(this._strengthExerciseVariantData.strengthMachine, this.sessionHandler) : undefined
  }

  eagerExerciseOrdinalSetAssignments () {
    return typeof this._strengthExerciseVariantData.exerciseOrdinalSetAssignments !== 'undefined' ? this._strengthExerciseVariantData.exerciseOrdinalSetAssignments.map(exerciseOrdinalSetAssignment => new ExerciseOrdinalSetAssignment(exerciseOrdinalSetAssignment, this.sessionHandler)) : undefined
  }
}

/** @hidden */
export class PrivilegedStrengthExerciseVariants extends ModelList<PrivilegedStrengthExerciseVariant, StrengthExerciseVariantData, StrengthExerciseVariantListResponseMeta> {
  constructor (strengthExerciseVariants: StrengthExerciseVariantData[], strengthExerciseVariantsMeta: StrengthExerciseVariantListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStrengthExerciseVariant, strengthExerciseVariants, strengthExerciseVariantsMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthExerciseVariant extends StrengthExerciseVariant {
  async update (params: { variant: StrengthExerciseVariantType, attachment?: StrengthExerciseVariantAttachment, instructionalImage?: string | null, instructionalVideo?: string | null }) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:update', { ...params, id: this.id }) as StrengthExerciseVariantResponse
    this.setStrengthExerciseVariant(strengthExerciseVariant)
    return this
  }

  async delete () {
    await this.action('strengthExerciseVariant:delete', { id: this.id })
  }
}
