export type Layer = 'body' | 'eyes' | 'mouth' | 'hat' | 'cosmetics'

/** Packed pixel in `0xRRGGBBAA` order. */
export type Rgba = number

export type Colors = Record<Layer, string>

export const FRAME_TAG_NAMES = ['idle', 'jump', 'fall', 'land', 'run'] as const
export type FrameTag = (typeof FRAME_TAG_NAMES)[number]

export interface FrameTagDef {
  name: FrameTag
  from: number
  to: number
  duration: number
}

export interface SpriteDocument {
  name: string
  colors: Colors
  /** Each layer has exactly FRAME_COUNT frames, each a 32*32*4 RGBA buffer. */
  layers: Record<Layer, Uint8Array[]>
}

export type ValidationIssueCode =
  | 'body-empty'
  | 'body-not-grayscale'
  | 'partial-alpha'

export interface ValidationIssue {
  code: ValidationIssueCode
  severity: 'error' | 'warning'
  message: string
  layer?: Layer
  frame?: number
}

export interface DudeManifest {
  version: 1
  name: string
  layers: Partial<Record<Layer, string>>
  colors: Colors
}
