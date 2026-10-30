import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildPackage,
  documentFromStrips,
  renderFramePng
} from '@twirapp/dudes-sprite'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '../../..')
const spritesDir = join(repoRoot, 'apps/playground/public/sprites')
const outputDir = join(here, '../public/templates')

const templates = [
  { id: 'dude', name: 'Dude', body: 'body/dude.png' },
  { id: 'cat', name: 'Cat', body: 'body/cat.png' },
  { id: 'devil', name: 'Devil', body: 'body/devil.png' }
] as const

await mkdir(outputDir, { recursive: true })

const eyes = new Uint8Array(
  await readFile(join(spritesDir, 'eyes/dude.png'))
)

for (const template of templates) {
  const body = new Uint8Array(
    await readFile(join(spritesDir, template.body))
  )

  const doc = documentFromStrips(template.name, { body, eyes })
  await writeFile(
    join(outputDir, `${template.id}.zip`),
    buildPackage(doc)
  )
  await writeFile(
    join(outputDir, `${template.id}.png`),
    renderFramePng(doc, 0, { scale: 4 })
  )
  console.log(`built ${template.id}`)
}
