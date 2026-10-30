import type { Colors, FrameTagDef, Layer } from './types.js'

export const FRAME_SIZE = 32
export const FRAME_COUNT = 9
export const STRIP_WIDTH = 288

export const LAYERS: readonly Layer[] = [
  'body',
  'eyes',
  'mouth',
  'hat',
  'cosmetics'
]

export const FRAME_TAGS: readonly FrameTagDef[] = [
  { name: 'idle', from: 0, to: 2, duration: 300 },
  { name: 'jump', from: 3, to: 3, duration: 100 },
  { name: 'fall', from: 4, to: 4, duration: 100 },
  { name: 'land', from: 5, to: 5, duration: 100 },
  { name: 'run', from: 6, to: 8, duration: 100 }
]

export const FRAME_DURATIONS: readonly number[] = FRAME_TAGS.flatMap((tag) =>
  Array.from({ length: tag.to - tag.from + 1 }, () => tag.duration)
)

export const LOOP_DURATION = FRAME_DURATIONS.reduce(
  (total, duration) => total + duration,
  0
)

export const PREVIEW_COLUMNS = 3

export const DEFAULT_COLORS: Colors = {
  body: '#969696',
  eyes: '#FFFFFF',
  mouth: '#FFFFFF',
  hat: '#FFFFFF',
  cosmetics: '#FFFFFF'
}
