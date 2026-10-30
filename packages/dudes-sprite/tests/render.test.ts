import { expect, it } from 'vitest'

import {
  createDocument,
  decodePng,
  renderFrame,
  renderFramePng,
  renderPreviewPng,
  rgba,
  setPixel,
  validateDocument
} from '../src/index.js'

it('multiplies white body by body color and keeps black', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 0, 0, rgba(255, 255, 255))
  setPixel(doc, 'body', 0, 1, 0, rgba(0, 0, 0))

  const out = renderFrame(doc, 0)
  expect([...out.slice(0, 4)]).toEqual([0x96, 0x96, 0x96, 0xff])
  expect([...out.slice(4, 8)]).toEqual([0, 0, 0, 255])
})

it('composites layers in engine order', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 2, 2, rgba(255, 255, 255))
  setPixel(doc, 'eyes', 0, 2, 2, rgba(255, 0, 0))

  const index = (2 * 32 + 2) * 4
  expect([...renderFrame(doc, 0).slice(index, index + 4)]).toEqual([
    255, 0, 0, 255
  ])
})

it('renders a 3x3 contact sheet at scale', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 4, 0, 0, rgba(255, 255, 255))

  const image = decodePng(renderPreviewPng(doc, { scale: 4 }))
  expect([image.width, image.height]).toEqual([384, 384])

  const index = (128 * 384 + 128) * 4
  expect([...image.data.slice(index, index + 4)]).toEqual([
    0x96, 0x96, 0x96, 0xff
  ])
  expect(image.data[(383 * 384 + 383) * 4 + 3]).toBe(255)
})

it('renders a single frame on checkerboard', () => {
  const image = decodePng(
    renderFramePng(createDocument('T'), 3, { scale: 8 })
  )
  expect([image.width, image.height]).toEqual([256, 256])
})

it('exposes a valid template-ready document', () => {
  const doc = createDocument('T')
  setPixel(doc, 'body', 0, 5, 5, rgba(255, 255, 255))
  expect(validateDocument(doc)).toEqual([])
})

it('rejects out-of-range frames', () => {
  expect(() => renderFrame(createDocument('T'), 9)).toThrow(
    /frame must be 0\.\.8/
  )
  expect(() =>
    renderFramePng(createDocument('T'), -1)
  ).toThrow(/frame must be 0\.\.8/)
})
