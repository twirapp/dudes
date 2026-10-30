import { expect, it } from 'vitest'

import {
  cloneDocument,
  createDocument,
  getPixel,
  rgba,
  setPixel
} from '../src/index.js'

it('creates a document with the engine shape', () => {
  const doc = createDocument('Test')

  expect(doc.name).toBe('Test')
  expect(Object.keys(doc.layers)).toEqual([
    'body',
    'eyes',
    'mouth',
    'hat',
    'cosmetics'
  ])
  expect(doc.layers.body).toHaveLength(9)
  expect(doc.layers.body[0]).toHaveLength(32 * 32 * 4)
  expect(doc.colors.body).toBe('#969696')
  expect(getPixel(doc, 'body', 0, 0, 0)).toBe(0)
})

it('clones deeply', () => {
  const doc = createDocument('Test')
  const copy = cloneDocument(doc)
  setPixel(copy, 'body', 3, 5, 7, rgba(255, 0, 0))

  expect(getPixel(copy, 'body', 3, 5, 7)).toBe(0xff0000ff)
  expect(getPixel(doc, 'body', 3, 5, 7)).toBe(0)
})

it('rejects out-of-bounds frames and coordinates', () => {
  const doc = createDocument('Test')

  expect(() => setPixel(doc, 'body', 9, 0, 0, rgba(0, 0, 0))).toThrow(
    RangeError
  )
  expect(() => setPixel(doc, 'body', 0, 32, 0, rgba(0, 0, 0))).toThrow(
    RangeError
  )
  expect(() => setPixel(doc, 'body', 0, -1, 0, rgba(0, 0, 0))).toThrow(
    RangeError
  )
  expect(() =>
    setPixel(doc, 'nope' as never, 0, 0, 0, rgba(0, 0, 0))
  ).toThrow(/unknown layer/)
})
