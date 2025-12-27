import type { DudesFrameTag } from '@twirapp/dudes-vue'

export const EDITOR_TOOLS = ['draw', 'erase', 'fill'] as const

export type EditorTool = typeof EDITOR_TOOLS[number]

export const TOTAL_FRAMES = 9
export const CANVAS_SCALE = 12
export const CANVAS_CELL_SIZE = `${CANVAS_SCALE * 2}px`
export const SPRITE_SIZE = 32
export const MIDDLE_BUTTON = 1

export interface AnimationRange {
  from: number
  to: number
}

export const ANIMATION_RANGES: Record<DudesFrameTag, AnimationRange> = {
  idle: { from: 0, to: 2 },
  jump: { from: 3, to: 3 },
  fall: { from: 4, to: 4 },
  land: { from: 5, to: 5 },
  walk: { from: 6, to: 8 },
}
