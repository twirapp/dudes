import type { Rgba } from './types.js'

export const TRANSPARENT: Rgba = 0

export function rgba(r: number, g: number, b: number, a = 255): Rgba {
  return (((r << 24) | (g << 16) | (b << 8) | a) >>> 0) as Rgba
}

const HEX_RE = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/

export function parseHexColor(hex: string): Rgba {
  const match = HEX_RE.exec(hex)
  if (!match) {
    throw new RangeError(`Invalid hex color: ${hex}`)
  }

  const rgb = Number.parseInt(match[1], 16)
  const alpha = match[2] ? Number.parseInt(match[2], 16) : 255
  return ((rgb * 256 + alpha) >>> 0) as Rgba
}

export function formatHexColor(color: Rgba): string {
  return `#${(color >>> 0).toString(16).padStart(8, '0')}`
}

export function isTransparent(color: Rgba): boolean {
  return (color & 0xff) === 0
}
