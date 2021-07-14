import { Model } from '../model'
import { SessionHandler } from '../session'

export enum MuscleIdentifier {
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

export enum MuscleGroup {
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

export enum MuscleArea {
  LowerBody = 'lowerBody',
  UpperBody = 'upperBody',
  Core = 'core'
}

export enum MuscleTargetLevel {
  Primary = 'primary',
  Secondary = 'secondary',
  Stabilizer = 'stabilizer'
}

export enum MuscleSorting {
  ID = 'id',
  Muscle = 'muscle',
  TargetLevel = 'targetLevel'
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
