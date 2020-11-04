import { Model } from '../model'
import { AuthenticatedResponse, SessionHandler } from '../session'

export const enum MuscleIdentifier {
  Omohyoid = 'omohyoid',
  LevatorScapulae = 'levatorScapulae',
  Sternohyoid = 'sternohyoid',
  Sternocleidomastoid = 'sternocleidomastoid',
  PectoralisMajor = 'pectoralisMajor',
  PectoralisMinor = 'pectoralisMinor',
  Deltoid = 'deltoid',
  Brachialis = 'brachialis',
  BicepsBrachii = 'bicepsBrachii',
  TricepsBrachii = 'tricepsBrachii',
  PronatorTeres = 'pronatorTeres',
  PalmarisLongus = 'palmarisLongus',
  ExtensorPollicisBrevis = 'extensorPollicisBrevis',
  ExtensorPollicisLongus = 'extensorPollicisLongus',
  AbductorPollicisLongus = 'abductorPollicisLongus',
  FlexorCarpiRadialis = 'flexorCarpiRadialis',
  Brachioradialis = 'brachioradialis',
  FlexorCarpiUlnaris = 'flexorCarpiUlnaris',
  ExtensorCarpiUlnaris = 'extensorCarpiUlnaris',
  SerratusAnterior = 'serratusAnterior',
  InternalOblique = 'internalOblique',
  ExternalOblique = 'externalOblique',
  RectusAdbominis = 'rectusAdbominis',
  Transversalis = 'transversalis',
  Sartorius = 'sartorius',
  Piriformis = 'piriformis',
  Pectineus = 'pectineus',
  AdductorLongus = 'adductorLongus',
  AdductorBrevis = 'adductorBrevis',
  Gracilis = 'gracilis',
  TensorFasciaeLatae = 'tensorFasciaeLatae',
  VastusMedialis = 'vastusMedialis',
  RectusFemoris = 'rectusFemoris',
  VastusIntermedius = 'vastusIntermedius',
  VastusLateralis = 'vastusLateralis',
  Gastrocnemius = 'gastrocnemius',
  Soleius = 'soleius',
  TibialisAnterior = 'tibialisAnterior',
  TibialisPosterior = 'tibialisPosterior',
  PeroneusLongus = 'peroneusLongus',
  PeroneusBrevis = 'peroneusBrevis',
  ExtensorDigitorumLongus = 'extensorDigitorumLongus',
  FlexorHallucisLongus = 'flexorHallucisLongus',
  FlexorDigitorumLongus = 'flexorDigitorumLongus',
  Plantaris = 'plantaris',
  BicepsFemoris = 'bicepsFemoris',
  AdductorMagnus = 'adductorMagnus',
  Semitendinosus = 'semitendinosus',
  Semimembranosus = 'semimembranosus',
  GluteusMinimus = 'gluteusMinimus',
  GluteusMedius = 'gluteusMedius',
  GluteusMaximus = 'gluteusMaximus',
  PsoasMinor = 'psoasMinor',
  PsoasMajor = 'psoasMajor',
  Iliacus = 'iliacus',
  TeresMinor = 'teresMinor',
  TeresMajor = 'teresMajor',
  Infraspinatus = 'infraspinatus',
  RhomboidMinor = 'rhomboidMinor',
  RhomboidMajor = 'rhomboidMajor',
  Trapezius = 'trapezius',
  LatissimusDorsi = 'latissimusDorsi',
  Semispinalis = 'semispinalis',
  ErectorSpinae = 'erectorSpinae',
  Multifidus = 'multifidus'
}

export const enum MuscleGroup {
  Abs = 'abs',
  Back = 'back',
  Biceps = 'biceps',
  Calves = 'calves',
  Chest = 'chest',
  Forearms = 'forearms',
  Glutes = 'glutes',
  Hamstrings = 'hamstrings',
  HipFlexors = 'hipFlexors',
  Neck = 'neck',
  Shoulders = 'shoulders',
  Triceps = 'triceps',
  UpperBack = 'upperBack'
}

export const enum MuscleArea {
  LowerBody = 'lowerBody',
  UpperBody = 'upperBody',
  Core = 'core'
}

export const enum MuscleTargetLevel {
  Primary = 'primary',
  Secondary = 'secondary',
  Stabilizer = 'stabilizer'
}

export interface MuscleData {
  id: number
  muscle: MuscleIdentifier
  group: MuscleGroup
  area: MuscleArea
  targetLevel: MuscleTargetLevel
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

  get id () {
    return this._muscleData.id
  }

  get muscle () {
    return this._muscleData.muscle
  }

  get group () {
    return this._muscleData.group
  }

  get area () {
    return this._muscleData.area
  }

  get targetLevel () {
    return this._muscleData.targetLevel
  }
}

export interface StrengthExerciseMuscleResponse extends AuthenticatedResponse {
  strengthExerciseMuscle: MuscleData
}

export class StrengthExerciseMuscle extends Muscle {
  async reload () {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:show', { id: this.id }) as StrengthExerciseMuscleResponse
    this.setMuscleData(strengthExerciseMuscle)
    return this
  }
}

/** @hidden */
export class PrivilegedStrengthExerciseMuscle extends StrengthExerciseMuscle {
  async update (params: { targetLevel: MuscleTargetLevel}) {
    const { strengthExerciseMuscle } = await this.action('strengthExerciseMuscle:update', { ...params, id: this.id }) as StrengthExerciseMuscleResponse
    this.setMuscleData(strengthExerciseMuscle)
    return this
  }

  async delete () {
    await this.action('strengthExerciseMuscle:delete', { id : this.id })
  }
}

export interface StretchExerciseMuscleResponse extends AuthenticatedResponse {
  stretchExerciseMuscle: MuscleData
}

export class StretchExerciseMuscle extends Muscle {
  async reload () {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:show', { id: this.id }) as StretchExerciseMuscleResponse
    this.setMuscleData(stretchExerciseMuscle)
    return this
  }
}

/** @hidden */
export class PrivilegedStretchExerciseMuscle extends StretchExerciseMuscle {
  async update (params: { targetLevel: MuscleTargetLevel}) {
    const { stretchExerciseMuscle } = await this.action('stretchExerciseMuscle:update', { ...params, id: this.id }) as StretchExerciseMuscleResponse
    this.setMuscleData(stretchExerciseMuscle)
    return this
  }

  async delete () {
    await this.action('stretchExerciseMuscle:delete', { id : this.id })
  }
}

export interface CardioExerciseMuscleResponse extends AuthenticatedResponse {
  cardioExerciseMuscle: MuscleData
}

export class CardioExerciseMuscle extends Muscle {
  async reload () {
    const { cardioExerciseMuscle } = await this.action('cardioExerciseMuscle:show', { id: this.id }) as CardioExerciseMuscleResponse
    this.setMuscleData(cardioExerciseMuscle)
    return this
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
