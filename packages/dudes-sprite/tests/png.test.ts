import { expect, it } from 'vitest'

import {
  createDocument,
  decodePng,
  documentFromStrips,
  documentToStrips,
  emptyStrip,
  encodePng,
  getPixel,
  setPixel
} from '../src/index.js'

it('round-trips RGBA pixels through PNG', () => {
  const data = new Uint8Array(4 * 4 * 4)
  data.set([255, 0, 0, 255], 0)

  const decoded = decodePng(encodePng(data, 4, 4))
  expect(decoded.width).toBe(4)
  expect(decoded.height).toBe(4)
  expect([...decoded.data.slice(0, 4)]).toEqual([255, 0, 0, 255])
})

it('lays frames left to right at 32px offsets', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 4, 5, 7, 0xff0000ff)

  const strips = documentToStrips(doc)
  const strip = decodePng(strips.body)

  expect(strip.width).toBe(288)
  expect(strip.height).toBe(32)

  const index = (7 * 288 + 4 * 32 + 5) * 4
  expect([...strip.data.slice(index, index + 4)]).toEqual([255, 0, 0, 255])
})

it('reads strips back into the same frames', () => {
  const doc = createDocument('T')
  setPixel(doc, 'eyes', 8, 31, 0, 0x00ff00ff)

  const restored = documentFromStrips('T', documentToStrips(doc))
  expect(getPixel(restored, 'eyes', 8, 31, 0)).toBe(0x00ff00ff)
  expect(getPixel(restored, 'eyes', 7, 31, 0)).toBe(0)
})

it('places every frame at its own 32px offset', () => {
  const doc = createDocument('T')
  for (let frame = 0; frame < 9; frame++) {
    setPixel(doc, 'body', frame, 31, 31, ((frame + 1) << 24) | 0x000203ff)
  }

  const strip = decodePng(documentToStrips(doc).body)
  for (let frame = 0; frame < 9; frame++) {
    const index = (31 * 288 + frame * 32 + 31) * 4
    expect([...strip.data.slice(index, index + 4)]).toEqual([
      frame + 1,
      2,
      3,
      255
    ])
  }
})

it('fills missing layers with transparent strips', () => {
  const doc = documentFromStrips('T', { body: emptyStrip() })
  expect(getPixel(doc, 'eyes', 0, 0, 0)).toBe(0)
})

it('rejects wrong strip size', () => {
  const png = encodePng(new Uint8Array(2 * 2 * 4), 2, 2)
  expect(() => documentFromStrips('T', { body: png })).toThrow(
    /must be 288x32/
  )
})

it('ignores invalid manifest colors', () => {
  const doc = documentFromStrips(
    'T',
    { body: emptyStrip() },
    { body: 'red' }
  )
  expect(doc.colors.body).toBe('#969696')
})
