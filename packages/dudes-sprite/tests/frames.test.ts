import { expect, it } from 'vitest'

import {
  clearFrame,
  copyFrame,
  createDocument,
  frameAt,
  getPixel,
  mirrorFrame,
  setPixel,
  shiftFrame
} from '../src/index.js'

const RED = 0xff0000ff
const BLUE = 0x0000ffff

it('copies every layer of a frame', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 1, 1, RED)
  copyFrame(doc, 0, 1)

  expect(getPixel(doc, 'body', 1, 1, 1)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 1, 1)).toBe(RED)
})

it('shifts without wrapping and clears vacated pixels', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 0, 0, RED)
  setPixel(doc, 'body', 0, 31, 0, BLUE)

  shiftFrame(doc, 0, 1, 0)
  expect(getPixel(doc, 'body', 0, 1, 0)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 0, 0)).toBe(0)
  expect(getPixel(doc, 'body', 0, 31, 0)).toBe(0)

  shiftFrame(doc, 0, 0, 1)
  expect(getPixel(doc, 'body', 0, 1, 1)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 1, 0)).toBe(0)
})

it('mirrors horizontally and vertically', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 0, 0, RED)
  mirrorFrame(doc, 0, 'horizontal')

  expect(getPixel(doc, 'body', 0, 31, 0)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 0, 0)).toBe(0)

  setPixel(doc, 'body', 0, 0, 1, BLUE)
  mirrorFrame(doc, 0, 'vertical')
  expect(getPixel(doc, 'body', 0, 0, 30)).toBe(BLUE)
})

it('clears one layer or the whole frame', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 2, 0, 0, RED)
  setPixel(doc, 'eyes', 2, 0, 0, RED)

  clearFrame(doc, 2, 'body')
  expect(getPixel(doc, 'body', 2, 0, 0)).toBe(0)
  expect(getPixel(doc, 'eyes', 2, 0, 0)).toBe(RED)

  clearFrame(doc, 2)
  expect(getPixel(doc, 'eyes', 2, 0, 0)).toBe(0)
})

it('maps elapsed time to engine frames', () => {
  expect(
    [0, 299, 300, 899, 900, 999, 1499, 1500].map(frameAt)
  ).toEqual([0, 0, 1, 2, 3, 3, 8, 0])
})
