import { expect, it } from 'vitest'

import {
  createDocument,
  getPixel,
  setPixel
} from '@twirapp/dudes-sprite'

import {
  assertExportable,
  exportPackageBytes,
  importPackageBytes,
  packageFileName
} from '../src/lib/files.js'

it('exports a valid package and imports it back', async () => {
  const doc = createDocument('X')
  setPixel(doc, 'body', 0, 1, 1, 0xffffffff)

  const zip = exportPackageBytes(doc)
  const restored = await importPackageBytes(zip)

  expect(getPixel(restored, 'body', 0, 1, 1)).toBe(0xffffffff)
})

it('blocks export when validation has errors', () => {
  expect(() => assertExportable(createDocument('X'))).toThrow(
    /body layer is empty/i
  )

  const colored = createDocument('X')
  setPixel(colored, 'body', 0, 1, 1, 0xff0000ff)
  expect(() => assertExportable(colored)).toThrow(/grayscale/i)
})

it('slugifies the package file name', () => {
  expect(packageFileName('My Dude!')).toBe('my-dude.zip')
  expect(packageFileName('   ')).toBe('dude.zip')
})
