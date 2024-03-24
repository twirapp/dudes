export const ROUND = 1000
export const DELTA_TIME = 0.02 * ROUND
export const SPRITE_SIZE = 32

type Collider = {
  X: number
  Y: number
  Width: number
  Height: number
}

export const Direction = {
  Left: -1,
  Right: 1
}

export const Collider: Collider = {
  X: 8,
  Y: 3,
  Width: 16,
  Height: 22
}
