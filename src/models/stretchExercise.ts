import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliases, ExerciseAliasListResponse, ExerciseAliasResponse, ExerciseAliasSorting, PrivilegedExerciseAlias, PrivilegedExerciseAliases } from './exerciseAlias'
import { MuscleData, MuscleIdentifier, MuscleSorting, MuscleTargetLevel } from './muscle'
import { PrivilegedStretchExerciseMuscle, PrivilegedStretchExerciseMuscles, StretchExerciseMuscle, StretchExerciseMuscleListResponse, StretchExerciseMuscleResponse, StretchExerciseMuscles } from './stretchExerciseMuscle'
import { PrivilegedStretchExerciseVariant, PrivilegedStretchExerciseVariants, StretchExerciseVariant, StretchExerciseVariantData, StretchExerciseVariantListResponse, StretchExerciseVariantResponse, StretchExerciseVariants, StretchExerciseVariantSorting, StretchExerciseVariantType } from './stretchExerciseVariant'

export const enum StretchExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias'
}

export interface StretchExerciseData {
  id: number
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  stretchExerciseVariants?: StretchExerciseVariantData[]
  stretchExerciseMuscles?: MuscleData[]
}

export interface StretchExerciseResponse extends AuthenticatedResponse {
  stretchExercise: StretchExerciseData
}

export interface StretchExerciseListResponse extends AuthenticatedResponse {
  stretchExercises: StretchExerciseData[]
  stretchExercisesMeta: StretchExerciseListResponseMeta
}

export interface StretchExerciseListResponseMeta extends ListMeta {
  defaultAlias?: string
  sort: StretchExerciseSorting
}

export class StretchExercises extends ModelList<StretchExercise, StretchExerciseData, StretchExerciseListResponseMeta> {
  constructor (stretchExercises: StretchExerciseData[], stretchExercisesMeta: StretchExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(StretchExercise, stretchExercises, stretchExercisesMeta, sessionHandler)
  }
}

export class StretchExercise extends Model {
  protected _stretchExerciseData: StretchExerciseData

  constructor (stretchExerciseData: StretchExerciseData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._stretchExerciseData = stretchExerciseData
  }

  protected setStretchExerciseData (stretchExerciseData: StretchExerciseData) {
    this._stretchExerciseData = stretchExerciseData
  }

  async reload () {
    const { stretchExercise } = await this.action('stretchExercise:show', { id: this._stretchExerciseData.id }) as StretchExerciseResponse
    this.setStretchExerciseData(stretchExercise)
    return this
  }

  get id () {
    return this._stretchExerciseData.id
  }

  get defaultExerciseAlias () {
    return new ExerciseAlias(this._stretchExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  get exerciseAliases () {
    return this._stretchExerciseData.exerciseAliases ? this._stretchExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  async getExerciseAliases (options: {alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, stretchExerciseId: this.id }) as ExerciseAliasListResponse
    return new ExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  get stretchExerciseMuscles () {
    return this._stretchExerciseData.stretchExerciseMuscles ? this._stretchExerciseData.stretchExerciseMuscles.map(stretchExerciseMuscle => new StretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)) : undefined
  }

  async getStretchExerciseMuscles (options: {muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExerciseMuscles, stretchExerciseMusclesMeta } = await this.action('stretchExerciseMuscle:list', { ...options, stretchExerciseId: this.id }) as StretchExerciseMuscleListResponse
    return new StretchExerciseMuscles(stretchExerciseMuscles, stretchExerciseMusclesMeta, this.sessionHandler)
  }

  get stretchExerciseVariants () {
    return this._stretchExerciseData.stretchExerciseVariants ? this._stretchExerciseData.stretchExerciseVariants.map(stretchExerciseVariant => new StretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)) : undefined
  }

  async getStretchExerciseVariants (options: {stretchExerciseId?: number, stretchMachineId?: number, variant?: StretchExerciseVariantType, sort?: StretchExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExerciseVariants, stretchExerciseVariantsMeta } = await this.action('stretchExerciseVariant:list', options) as StretchExerciseVariantListResponse
    return new StretchExerciseVariants(stretchExerciseVariants, stretchExerciseVariantsMeta, this.sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStretchExercises extends ModelList<PrivilegedStretchExercise, StretchExerciseData, StretchExerciseListResponseMeta> {
  constructor (stretchExercises: StretchExerciseData[], stretchExercisesMeta: StretchExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStretchExercise, stretchExercises, stretchExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStretchExercise extends StretchExercise {
  async delete () {
    await this.action('stretchExercise:delete', { id : this.id })
  }

  async getExerciseAliases (options: {alias?: string, sort?: ExerciseAliasSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { exerciseAliases, exerciseAliasesMeta } = await this.action('exerciseAlias:list', { ...options, stretchExerciseId: this.id }) as ExerciseAliasListResponse
    return new PrivilegedExerciseAliases(exerciseAliases, exerciseAliasesMeta, this.sessionHandler)
  }

  async createExerciseAlias (params: {alias: string}) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias : params.alias, stretchExerciseId: this.id }) as ExerciseAliasResponse
    return new PrivilegedExerciseAlias(exerciseAlias, this.sessionHandler)
  }

  async getStretchExerciseMuscles (options: {muscle?: string, targetLevel?: MuscleTargetLevel, sort?: MuscleSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExerciseMuscles, stretchExerciseMusclesMeta } = await this.action('stretchExerciseMuscle:list', { ...options, stretchExerciseId: this.id }) as StretchExerciseMuscleListResponse
    return new PrivilegedStretchExerciseMuscles(stretchExerciseMuscles, stretchExerciseMusclesMeta, this.sessionHandler)
  }

  async createStretchExerciseMuscle (params: {muscle: MuscleIdentifier, targetLevel: MuscleTargetLevel}) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:create', { ...params, stretchExerciseId: this.id }) as StretchExerciseMuscleResponse
    return new PrivilegedStretchExerciseMuscle(stretchExerciseMuscle, this.sessionHandler)
  }

  async getStretchExerciseVariants (options: {stretchExerciseId?: number, stretchMachineId?: number, variant?: StretchExerciseVariantType, sort?: StretchExerciseVariantSorting, ascending?: boolean, limit?: number, offset?: number} = { }) {
    const { stretchExerciseVariants, stretchExerciseVariantsMeta } = await this.action('stretchExerciseVariant:list', options) as StretchExerciseVariantListResponse
    return new PrivilegedStretchExerciseVariants(stretchExerciseVariants, stretchExerciseVariantsMeta, this.sessionHandler)
  }

  async createStretchExerciseVariant (params: {stretchMachineId?: number, variant: StretchExerciseVariantType, instructionalImage?: string, instructionalVideo?: string }) {
    const { stretchExerciseVariant } = await this.action('stretchExerciseVariant:create', { ...params, stretchExerciseId: this.id }) as StretchExerciseVariantResponse
    return new PrivilegedStretchExerciseVariant(stretchExerciseVariant, this.sessionHandler)
  }
}
