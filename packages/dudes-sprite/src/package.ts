import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

import { LAYERS } from './constants.js'
import { PackageError } from './errors.js'
import { renderPreviewPng } from './render.js'
import { documentFromStrips, documentToStrips } from './strip.js'
import type { Colors, DudeManifest, Layer, SpriteDocument } from './types.js'

const LAYER_FILE_RE = /^[a-zA-Z0-9._-]+\.png$/

export function createManifest(doc: SpriteDocument): DudeManifest {
  return {
    version: 1,
    name: doc.name,
    layers: Object.fromEntries(
      LAYERS.map((layer) => [layer, `${layer}.png`])
    ) as DudeManifest['layers'],
    colors: { ...doc.colors }
  }
}

export function buildPackage(doc: SpriteDocument): Uint8Array {
  const strips = documentToStrips(doc)
  const files: Record<string, Uint8Array> = {}

  for (const layer of LAYERS) {
    files[`${layer}.png`] = strips[layer]
  }

  files['dude.json'] = strToU8(
    JSON.stringify(createManifest(doc), null, 2)
  )
  files['preview.png'] = renderPreviewPng(doc, { scale: 4 })

  return zipSync(files)
}

export function readPackage(zip: Uint8Array): SpriteDocument {
  let files: Record<string, Uint8Array>

  try {
    files = unzipSync(zip)
  } catch {
    throw new PackageError('Invalid package archive')
  }

  const manifestBytes = files['dude.json']
  if (!manifestBytes) {
    throw new PackageError('Package is missing dude.json')
  }

  let manifest: DudeManifest
  try {
    manifest = JSON.parse(strFromU8(manifestBytes))
  } catch {
    throw new PackageError('Package dude.json is not valid JSON')
  }

  if (!manifest || typeof manifest !== 'object') {
    throw new PackageError('Package dude.json must be an object')
  }

  if (manifest.version !== 1) {
    throw new PackageError(`Unsupported package version: ${String(manifest.version)}`)
  }

  if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
    throw new PackageError('Package name is missing')
  }

  const layers = manifest.layers
  if (layers && typeof layers === 'object') {
    for (const layer of LAYERS) {
      const fileName = layers[layer]
      if (fileName !== undefined && !LAYER_FILE_RE.test(fileName)) {
        throw new PackageError(`Invalid layer file name: ${String(fileName)}`)
      }
    }
  }

  const bodyFileName = layers?.body ?? 'body.png'
  if (!files[bodyFileName]) {
    throw new PackageError('Package is missing body.png')
  }

  const strips: Partial<Record<Layer, Uint8Array>> = {}
  const colors: Partial<Colors> = manifest.colors ?? {}

  for (const layer of LAYERS) {
    const fileName = manifest.layers?.[layer] ?? `${layer}.png`
    const file = files[fileName]
    if (file) strips[layer] = file
  }

  return documentFromStrips(manifest.name, strips, colors)
}
