import { ListMeta, Model, ModelList } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum MuscleGroup {
  Abs = 'abs',
  Back = 'back',
  Biceps = 'biceps',
  Calves = 'calves',
  Chest = 'chest',
  Forearms = 'forearms',
  Glutes = 'glutes',
  Hamstrings = 'hamstrings',
  LowerBack = 'lowerBack',
  Neck = 'neck',
  Shoulders = 'shoulders',
  Thighs = 'thighs',
  Triceps = 'triceps',
  UpperBack = 'upperBack'
}

export const enum MuscleBodyPart {
  Abs = 'abs',
  Arms = 'arms',
  Back = 'back',
  Chest = 'chest',
  Legs = 'legs',
  Neck = 'neck',
  Shoulders = 'shoulders'
}

export const enum MuscleSorting {
  ID = 'id',
  Name = 'name',
  Group = 'group',
  Part = 'part'
}

export interface MuscleData {
  id: number
  name: string
  group: MuscleGroup
  part: MuscleBodyPart
}

export interface MuscleResponse extends AuthenticatedResponse {
  muscle: MuscleData
}

export interface MuscleListResponse extends AuthenticatedResponse {
  muscles: MuscleData[]
  musclesMeta: MuscleListResponseMeta
}

export interface MuscleListResponseMeta extends ListMeta {
  name: string | undefined
  sort: MuscleSorting
}

export class Muscles extends ModelList<Muscle, MuscleData, MuscleListResponseMeta> {
  constructor (muscles: MuscleData[], musclesMeta: MuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(Muscle, muscles, musclesMeta, sessionHandler)
  }
}

export class Muscle extends Model {
  protected _muscleData: MuscleData

  constructor (muscleData: MuscleData, sessionHandler: SessionHandler) {
    super(sessionHandler)
    this._muscleData = muscleData
  }

  protected setMuscleData (muscleData: MuscleData) {
    this._muscleData = muscleData
  }

  async reload () {
    const { muscle } = await this.action('muscle:show', { id: this._muscleData.id }) as MuscleResponse
    this.setMuscleData(muscle)
    return this
  }

  get id () {
    return this._muscleData.id
  }

  get name () {
    return this._muscleData.name
  }

  get group () {
    return this._muscleData.group
  }

  get part () {
    return this._muscleData.part
  }
}

/** @hidden */
export class PrivilegedMuscles extends ModelList<PrivilegedMuscle, MuscleData, MuscleListResponseMeta> {
  constructor (muscles: MuscleData[], musclesMeta: MuscleListResponseMeta, sessionHandler: SessionHandler) {
    super(PrivilegedMuscle, muscles, musclesMeta, sessionHandler)
  }
}

/** @hidden */
export class PrivilegedMuscle extends Muscle {
  constructor (muscleData: MuscleData, sessionHandler: SessionHandler) {
    super(muscleData, sessionHandler)
  }

  async update (params: { name: string, group: MuscleGroup, part: MuscleBodyPart }) {
    const { muscle } = await this.action('muscle:update', { ...params, id: this.id }) as MuscleResponse
    this.setMuscleData(muscle)
    return this
  }

  async delete () {
    await this.action('muscle:delete', { id : this.id })
  }
}
