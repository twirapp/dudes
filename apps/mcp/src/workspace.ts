import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'

import {
  createManifest,
  documentFromStrips,
  documentToStrips,
  LAYERS,
  PackageError,
  renderPreviewPng
} from '@twirapp/dudes-sprite'
import type { Colors, Layer, SpriteDocument } from '@twirapp/dudes-sprite'

export function resolveProjectDir(root: string, rel: string): string {
  if (!rel.trim()) {
    throw new Error('path is required')
  }

  if (rel.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(rel)) {
    throw new Error('path outside workspace')
  }

  const base = resolve(root)
  const target = resolve(base, rel)

  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error('path outside workspace')
  }

  return target
}

export function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'dude'
}

export async function writeProjectDir(
  dir: string,
  doc: SpriteDocument
): Promise<string[]> {
  await mkdir(dir, { recursive: true })

  const strips = documentToStrips(doc)
  const files: string[] = []

  for (const layer of LAYERS) {
    const fileName = `${layer}.png`
    await writeFile(join(dir, fileName), strips[layer])
    files.push(fileName)
  }

  await writeFile(
    join(dir, 'dude.json'),
    JSON.stringify(createManifest(doc), null, 2)
  )
  await writeFile(join(dir, 'preview.png'), renderPreviewPng(doc, { scale: 4 }))

  files.push('dude.json', 'preview.png')
  return files
}

export async function readProjectDir(dir: string): Promise<SpriteDocument> {
  let manifestRaw: string
  try {
    manifestRaw = await readFile(join(dir, 'dude.json'), 'utf8')
  } catch {
    throw new PackageError(`Package is missing dude.json in ${dir}`)
  }

  let manifest: {
    version?: number
    name?: string
    layers?: Partial<Record<Layer, string>>
    colors?: Partial<Colors>
  }

  try {
    manifest = JSON.parse(manifestRaw)
  } catch {
    throw new PackageError('Package dude.json is not valid JSON')
  }

  if (!manifest || typeof manifest !== 'object') {
    throw new PackageError('Package dude.json must be an object')
  }

  if (manifest.version !== 1) {
    throw new PackageError(
      `Unsupported package version: ${String(manifest.version)}`
    )
  }

  if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
    throw new PackageError('Package name is missing')
  }

  const strips: Partial<Record<Layer, Uint8Array>> = {}

  for (const layer of LAYERS) {
    const fileName = manifest.layers?.[layer] ?? `${layer}.png`
    if (!/^[a-zA-Z0-9._-]+\.png$/.test(fileName)) {
      throw new PackageError(`Invalid layer file name: ${fileName}`)
    }
    try {
      strips[layer] = new Uint8Array(
        await readFile(join(dir, fileName))
      )
    } catch {
      // optional layer
    }
  }

  if (!strips.body) {
    throw new PackageError('Package is missing body.png')
  }

  return documentFromStrips(manifest.name, strips, manifest.colors ?? {})
}
