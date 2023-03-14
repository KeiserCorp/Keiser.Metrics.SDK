import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './exerciseAlias'
import { MuscleData, MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from './muscle'
import { PrivilegedStrengthExerciseMuscle, PrivilegedStrengthExerciseMuscles, StrengthExerciseMuscle, StrengthExerciseMuscleListResponse, StrengthExerciseMuscleResponse, StrengthExerciseMuscles } from './strengthExerciseMuscle'
import { PrivilegedStrengthExerciseVariant, PrivilegedStrengthExerciseVariants, StrengthExerciseVariant, StrengthExerciseVariantAttachment, StrengthExerciseVariantData, StrengthExerciseVariantListResponse, StrengthExerciseVariantResponse, StrengthExerciseVariants, StrengthExerciseVariantSorting, StrengthExerciseVariantType } from './strengthExerciseVariant'

export enum StrengthExerciseCategory {
  LowerBody = 'lowerBody',
  UpperBody = 'upperBody',
  Core = 'core',
  Explosive = 'explosive',
  Complex = 'complex'
}

export enum StrengthExerciseMovementDEP {
  Isolation = 'isolation',
  Compound = 'compound'
}

export enum StrengthExerciseMovement {
  Unilateral = 'unilateral',
  Bilateral = 'bilateral'
}

export enum StrengthExercisePlane {
  Sagittal = 'sagittal',
  Frontal = 'frontal',
  Transverse = 'transverse'
}

export enum StrengthExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias',
  Category = 'category',
  Movement = 'movement',
  Plane = 'plane'
}

export interface StrengthExerciseData {
  id: number
  category: StrengthExerciseCategory
  movement: StrengthExerciseMovementDEP
  plane: StrengthExercisePlane
  humanMovement: StrengthExerciseMovement
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  strengthExerciseVariants?: StrengthExerciseVariantData[]
  strengthExerciseMuscles?: MuscleData[]
}

export interface StrengthExerciseResponse extends AuthenticatedResponse {
  strengthExercise: StrengthExerciseData
}

export interface StrengthExerciseListResponse extends AuthenticatedResponse {
  strengthExercises: StrengthExerciseData[]
  strengthExercisesMeta: StrengthExerciseListResponseMeta
}

export interface StrengthExerciseListResponseMeta extends ListMeta {
  defaultAlias?: string
  category?: StrengthExerciseCategory
  movement?: StrengthExerciseMovementDEP
  plane?: StrengthExercisePlane
  sort: StrengthExerciseSorting
}

export class StrengthExercises extends ModelList<StrengthExercise, StrengthExerciseData, StrengthExerciseListResponseMeta> {
  constructor (strengthExercises: StrengthExerciseData[], strengthExercisesMeta: StrengthExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(StrengthExercise, strengthExercises, strengthExercisesMeta, sessionHandler)
  }
}

export class StrengthExercise extends Model {
  protected _strengthExerciseData: StrengthExerciseData

  constructor (strengthExerciseData: StrengthExerciseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._strengthExerciseData = strengthExerciseData
  }

  protected setStrengthExerciseData (strengthExerciseData: StrengthExerciseData) {
    this._strengthExerciseData = strengthExerciseData
  }

  async reload () {
    const { strengthExercise } = await this.action('strengthExercise:show', { id: this._strengthExerciseData.id }) as StrengthExerciseResponse
    this.setStrengthExerciseData(strengthExercise)
    return this
  }

  ejectData () {
    return this.eject(this._strengthExerciseData)
  }

  get id () {
    return this._strengthExerciseData.id
  }

  get category () {
    return this._strengthExerciseData.category
  }

  get movement () {
    return this._strengthExerciseData.movement
  }

  get plane () {
    return this._strengthExerciseData.plane
  }

  eagerDefaultExerciseAlias () {
    return new ExerciseAlias(this._strengthExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  eagerExerciseAliases () {
    return typeof this._strengthExerciseData.exerciseAliases !== 'undefined' ? this._strengthExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  async getExerciseAliases (options: { alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, strengthExerciseId: this.id }) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  get strengthExerciseMuscles () {
    return typeof this._strengthExerciseData.strengthExerciseMuscles !== 'undefined' ? this._strengthExerciseData.strengthExerciseMuscles.map(strengthExerciseMuscle => new StrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)) : undefined
  }

  async getStrengthExerciseMuscles (options: { muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExerciseMuscles, strengthExerciseMusclesMeta } = await this.action('strengthExerciseMuscle:list', { ...options, strengthExerciseId: this.id }) as StrengthExerciseMuscleListResponse
    return new StrengthExerciseMuscles(strengthExerciseMuscles, strengthExerciseMusclesMeta, this.sessionHandler)
  }

  eagerStrengthExerciseVariants () {
    return typeof this._strengthExerciseData.strengthExerciseVariants !== 'undefined' ? this._strengthExerciseData.strengthExerciseVariants.map(strengthExerciseVariant => new StrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)) : undefined
  }

  async getStrengthExerciseVariants (options: { strengthExerciseId?: number, strengthMachineId?: number, variant?: StrengthExerciseVariantType, attachment?: StrengthExerciseVariantAttachment, sort?: StrengthExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExerciseVariants, strengthExerciseVariantsMeta } = await this.action('strengthExerciseVariant:list', options) as StrengthExerciseVariantListResponse
    return new StrengthExerciseVariants(strengthExerciseVariants, strengthExerciseVariantsMeta, this.sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthExercises extends ModelList<PrivilegedStrengthExercise, StrengthExerciseData, StrengthExerciseListResponseMeta> {
  constructor (strengthExercises: StrengthExerciseData[], strengthExercisesMeta: StrengthExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStrengthExercise, strengthExercises, strengthExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthExercise extends StrengthExercise {
  async update (params: { category: StrengthExerciseCategory, movement: StrengthExerciseMovementDEP, plane: StrengthExercisePlane, humanMovement: StrengthExerciseMovement }) {
    const { strengthExercise } = await this.action('strengthExercise:update', { ...params, id: this.id }) as StrengthExerciseResponse
    this.setStrengthExerciseData(strengthExercise)
    return this
  }

  async delete () {
    await this.action('strengthExercise:delete', { id: this.id })
  }

  async getExerciseAliases (options: { alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, strengthExerciseId: this.id }) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async createExerciseAlias (params: { alias: string }) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias: params.alias, strengthExerciseId: this.id }) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getStrengthExerciseMuscles (options: { muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExerciseMuscles, strengthExerciseMusclesMeta } = await this.action('strengthExerciseMuscle:list', { ...options, strengthExerciseId: this.id }) as StrengthExerciseMuscleListResponse
    return new PrivilegedStrengthExerciseMuscles(strengthExerciseMuscles, strengthExerciseMusclesMeta, this.sessionHandler)
  }

  async createStrengthExerciseMuscle (params: { muscle: MuscleIdentifier, targetLevel: MuscleTargetLevel }) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:create', { ...params, strengthExerciseId: this.id }) as StrengthExerciseMuscleResponse
    return new PrivilegedStrengthExerciseMuscle(strengthExerciseMuscle, this.sessionHandler)
  }

  async getStrengthExerciseVariants (options: { strengthExerciseId?: number, strengthMachineId?: number, variant?: StrengthExerciseVariantType, sort?: StrengthExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number } = { }) {
    const { strengthExerciseVariants, strengthExerciseVariantsMeta } = await this.action('strengthExerciseVariant:list', options) as StrengthExerciseVariantListResponse
    return new PrivilegedStrengthExerciseVariants(strengthExerciseVariants, strengthExerciseVariantsMeta, this.sessionHandler)
  }

  async createStrengthExerciseVariant (params: { strengthMachineId?: number, variant: StrengthExerciseVariantType, attachment?: StrengthExerciseVariantAttachment, equipmentMechanicalMovement: StrengthExerciseMovement, instructionalImage?: string | null, instructionalVideo?: string | null }) {
    const { strengthExerciseVariant } = await this.action('strengthExerciseVariant:create', { ...params, strengthExerciseId: this.id }) as StrengthExerciseVariantResponse
    return new PrivilegedStrengthExerciseVariant(strengthExerciseVariant, this.sessionHandler)
  }
}
