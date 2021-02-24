export interface A500TimeSeriesPoint {
  a500DataSetId?: number
  id: number
  left: A500ArmData
  right: A500ArmData
  timeSinceEpoch: number
}

export interface A500ArmData {
  force: number
  position: number
  power: number
  velocity: number
  acceleration: number
  forceOfMassAcceleration: number
  mechanicalWeight: number
}