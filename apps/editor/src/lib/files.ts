import {
  buildPackage,
  readPackage,
  validateDocument
} from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

export function assertExportable(doc: SpriteDocument): void {
  const errors = validateDocument(doc).filter(
    (issue) => issue.severity === 'error'
  )
  if (errors.length > 0) {
    throw new Error(errors[0].message)
  }
}

export function exportPackageBytes(doc: SpriteDocument): Uint8Array {
  assertExportable(doc)
  return buildPackage(doc)
}

export async function importPackageBytes(
  bytes: Uint8Array
): Promise<SpriteDocument> {
  const doc = readPackage(bytes)
  assertExportable(doc)
  return doc
}

export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function readFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

export function packageFileName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'dude'}.zip`
}
