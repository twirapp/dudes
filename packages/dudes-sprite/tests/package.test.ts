import { strToU8, unzipSync, zipSync } from 'fflate'
import { expect, it } from 'vitest'

import {
  buildPackage,
  createDocument,
  decodePng,
  DEFAULT_COLORS,
  emptyStrip,
  getPixel,
  readPackage,
  setPixel
} from '../src/index.js'

it('round-trips a package with manifest', () => {
  const doc = createDocument('Twir', { body: '#112233' })
  setPixel(doc, 'body', 2, 3, 4, 0xff0000ff)

  const zip = buildPackage(doc)
  const restored = readPackage(zip)

  expect(restored.name).toBe('Twir')
  expect(restored.colors.body).toBe('#112233')
  expect(getPixel(restored, 'body', 2, 3, 4)).toBe(0xff0000ff)
  const files = unzipSync(zip)
  expect(Object.keys(files)).toEqual(
    expect.arrayContaining([
      'body.png',
      'eyes.png',
      'mouth.png',
      'hat.png',
      'cosmetics.png',
      'dude.json',
      'preview.png'
    ])
  )
  const preview = decodePng(files['preview.png'])
  expect([preview.width, preview.height]).toEqual([384, 384])
})

it('requires a body strip', () => {
  const zip = zipSync({
    'dude.json': strToU8(
      JSON.stringify({
        version: 1,
        name: 'X',
        layers: {},
        colors: DEFAULT_COLORS
      })
    )
  })

  expect(() => readPackage(zip)).toThrow(/missing body\.png/)
})

it('rejects unknown manifest version', () => {
  const zip = zipSync({
    'dude.json': strToU8(JSON.stringify({ version: 2 })),
    'body.png': emptyStrip()
  })

  expect(() => readPackage(zip)).toThrow(/Unsupported package version/)
})

it('rejects a manifest that is not an object', () => {
  const zip = zipSync({ 'dude.json': strToU8('null') })
  expect(() => readPackage(zip)).toThrow(/must be an object/)
})

it('rejects layer file names that escape the package', () => {
  const zip = zipSync({
    'dude.json': strToU8(
      JSON.stringify({
        version: 1,
        name: 'X',
        layers: { body: '../../evil.png' },
        colors: DEFAULT_COLORS
      })
    ),
    'body.png': emptyStrip()
  })

  expect(() => readPackage(zip)).toThrow(/Invalid layer file name/)
})

it('uses the body file name from the manifest', () => {
  const zip = zipSync({
    'dude.json': strToU8(
      JSON.stringify({
        version: 1,
        name: 'Mapped',
        layers: { body: 'my-body.png' },
        colors: DEFAULT_COLORS
      })
    ),
    'my-body.png': emptyStrip()
  })

  expect(readPackage(zip).name).toBe('Mapped')
})

it('rejects broken archives', () => {
  expect(() => readPackage(new Uint8Array([1, 2, 3]))).toThrow(
    /Invalid package archive/
  )
})
