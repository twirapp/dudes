import { describe, expect, it } from 'vitest'

import {
  FRAME_COUNT,
  FRAME_SIZE,
  FRAME_TAGS,
  LOOP_DURATION,
  STRIP_WIDTH
} from '../src/index.js'

describe('format constants', () => {
  it('uses the engine format', () => {
    expect(FRAME_SIZE).toBe(32)
    expect(FRAME_COUNT).toBe(9)
    expect(STRIP_WIDTH).toBe(288)
    expect(LOOP_DURATION).toBe(1500)
  })

  it('keeps engine frame tags', () => {
    expect(FRAME_TAGS.map((tag) => tag.name)).toEqual([
      'idle',
      'jump',
      'fall',
      'land',
      'run'
    ])
    expect(
      FRAME_TAGS.map((tag) => [tag.from, tag.to, tag.duration])
    ).toEqual([
      [0, 2, 300],
      [3, 3, 100],
      [4, 4, 100],
      [5, 5, 100],
      [6, 8, 100]
    ])
  })
})
