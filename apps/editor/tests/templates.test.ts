import { readFile } from 'node:fs/promises'

import { expect, it } from 'vitest'

import { readPackage, validateDocument } from '@twirapp/dudes-sprite'

import { TEMPLATES } from '../src/lib/templates.js'

it('ships a package for every template', async () => {
  for (const template of TEMPLATES) {
    const bytes = new Uint8Array(
      await readFile(`public/templates/${template.id}.zip`)
    )
    const doc = readPackage(bytes)

    expect(doc.name.length).toBeGreaterThan(0)
    expect(validateDocument(doc)).toEqual([])
    expect(
      doc.layers.body.some((frame) =>
        frame.some((value, index) => index % 4 === 3 && value > 0)
      )
    ).toBe(true)
  }
})
