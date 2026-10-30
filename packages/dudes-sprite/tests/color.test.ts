import { expect, it } from 'vitest'

import {
  formatHexColor,
  isTransparent,
  parseHexColor,
  rgba,
  TRANSPARENT
} from '../src/index.js'

it('round-trips hex colors', () => {
  expect(parseHexColor('#969696')).toBe(0x969696ff)
  expect(parseHexColor('#96969680')).toBe(0x96969680)
  expect(formatHexColor(0x201533ff)).toBe('#201533ff')
})

it('packs rgba and detects transparency', () => {
  expect(rgba(32, 21, 51)).toBe(0x201533ff)
  expect(TRANSPARENT).toBe(0)
  expect(isTransparent(0)).toBe(true)
  expect(isTransparent(0x000000ff)).toBe(false)
})

it('rejects invalid hex', () => {
  expect(() => parseHexColor('red')).toThrow(RangeError)
  expect(() => parseHexColor('#fff')).toThrow(RangeError)
})
