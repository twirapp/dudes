import { expect, it } from 'vitest'

import {
  createDocument,
  getPixel,
  rgba,
  setPixel,
  validateDocument
} from '../src/index.js'

it('reports an empty body', () => {
  const doc = createDocument('T')
  expect(validateDocument(doc)).toContainEqual(
    expect.objectContaining({ code: 'body-empty', severity: 'error' })
  )
})

it('reports a colored body', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 1, 1, rgba(255, 0, 0))
  expect(validateDocument(doc)).toContainEqual(
    expect.objectContaining({
      code: 'body-not-grayscale',
      severity: 'error',
      frame: 0
    })
  )
})

it('accepts grayscale body and colored accessories', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 1, 1, rgba(214, 214, 214))
  setPixel(doc, 'eyes', 0, 1, 1, rgba(32, 21, 51))
  expect(validateDocument(doc)).toEqual([])
})

it('warns about partial alpha', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 1, 1, rgba(255, 255, 255, 128))
  expect(validateDocument(doc)).toContainEqual(
    expect.objectContaining({ code: 'partial-alpha', severity: 'warning' })
  )
})
