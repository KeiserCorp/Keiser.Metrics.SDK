import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'
import { ExerciseAlias, ExerciseAliasData, ExerciseAliasResponse } from './exerciseAlias'
import { StrengthMachineData } from './strengthMachine'

export const enum StrengthExerciseCategory {
  LowerBody = 'lowerBody',
  UpperBody = 'upperBody',
  Core = 'core',
  Explosive = 'explosive',
  Complex = 'complex'
}

export const enum StrengthExerciseMovement {
  Isolation = 'isolation',
  Compound = 'compound'
}

export const enum StrengthExercisePlane {
  Sagittal = 'sagittal',
  Frontal = 'frontal',
  Transverse = 'transverse'
}

export const enum StrengthExerciseSorting {
  ID = 'id',
  DefaultAlias = 'defaultAlias',
  Category = 'category',
  Movement = 'movement',
  Plane = 'plane'
}

export interface StrengthExerciseData {
  id: number
  category: StrengthExerciseCategory
  movement: StrengthExerciseMovement
  plane: StrengthExercisePlane
  defaultExerciseAlias: ExerciseAliasData
  exerciseAliases?: ExerciseAliasData[]
  strengthExerciseVariants?: any[] // To-Do: Add strengthExerciseVariants
  strengthExerciseMuscles?: any[] // To-Do: Add strengthExerciseMuscles
  strengthMachines?: StrengthMachineData[]
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
  movement?: StrengthExerciseMovement
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

  get defaultExerciseAlias () {
    return new ExerciseAlias(this._strengthExerciseData.defaultExerciseAlias, this.sessionHandler)
  }

  get exerciseAliases () {
    return this._strengthExerciseData.exerciseAliases ? this._strengthExerciseData.exerciseAliases.map(exerciseAlias => new ExerciseAlias(exerciseAlias, this.sessionHandler)) : undefined
  }

  // get strengthExercises () {
  //   return this._strengthExerciseData.strengthExercise ? new StrengthExercise(this._strengthExerciseData.strengthExercise, this.sessionHandler) : undefined
  // }
}

/** @hidden */
export class PrivilegedStrengthExercises extends ModelList<PrivilegedStrengthExercise, StrengthExerciseData, StrengthExerciseListResponseMeta> {
  constructor (strengthExercises: StrengthExerciseData[], strengthExercisesMeta: StrengthExerciseListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedStrengthExercise, strengthExercises, strengthExercisesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedStrengthExercise extends StrengthExercise {
  constructor (strengthExerciseData: StrengthExerciseData, sessionHandler: SessionHandler) {
    super(strengthExerciseData, sessionHandler)
  }

  async update (params: { category: StrengthExerciseCategory, movement: StrengthExerciseMovement, plane: StrengthExercisePlane }) {
    const { strengthExercise } = await this.action('strengthExercise:update', { ...params, id: this.id }) as StrengthExerciseResponse
    this.setStrengthExerciseData(strengthExercise)
    return this
  }

  async delete () {
    await this.action('strengthExercise:delete', { id : this.id })
  }

  async createExerciseAlias (params: {alias: string}) {
    const { exerciseAlias } = await this.action('exerciseAlias:create', { alias : params.alias, strengthExerciseId: this.id }) as ExerciseAliasResponse
    return new ExerciseAlias(exerciseAlias, this.sessionHandler)
  }
}
