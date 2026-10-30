import { expect, it } from 'vitest'

import {
  createDocument,
  drawEllipse,
  drawLine,
  drawRect,
  fillArea,
  getPixel
} from '../src/index.js'

const RED = 0xff0000ff
const BLUE = 0x0000ffff

it('draws lines including both endpoints', () => {
  const doc = createDocument('T')
  drawLine(doc, 'body', 0, 1, 1, 5, 1, RED)

  expect(getPixel(doc, 'body', 0, 1, 1)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 5, 1)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 3, 1)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 3, 2)).toBe(0)
})

it('draws filled and outlined rects', () => {
  const doc = createDocument('T')
  drawRect(doc, 'body', 0, 2, 2, 4, 4, RED)

  expect(getPixel(doc, 'body', 0, 2, 2)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 5, 5)).toBe(RED)

  drawRect(doc, 'eyes', 0, 10, 10, 3, 3, BLUE, false)
  expect(getPixel(doc, 'eyes', 0, 10, 10)).toBe(BLUE)
  expect(getPixel(doc, 'eyes', 0, 11, 11)).toBe(0)
})

it('draws ellipses inside the bounding box', () => {
  const doc = createDocument('T')
  drawEllipse(doc, 'body', 0, 8, 8, 10, 6, RED)

  expect(getPixel(doc, 'body', 0, 12, 10)).toBe(RED)
  expect(getPixel(doc, 'body', 0, 8, 8)).toBe(0)
})

it('flood fills a closed area and stops at borders', () => {
  const doc = createDocument('T')
  fillArea(doc, 'body', 0, 0, 0, RED)

  expect(getPixel(doc, 'body', 0, 31, 31)).toBe(RED)
  expect(getPixel(doc, 'eyes', 0, 31, 31)).toBe(0)
})

it('flood fill is a no-op for the same color', () => {
  const doc = createDocument('T')
  fillArea(doc, 'body', 0, 0, 0, RED)
  const before = doc.layers.body[0].slice()
  fillArea(doc, 'body', 0, 0, 0, RED)

  expect(doc.layers.body[0]).toEqual(before)
})
