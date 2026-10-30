import { FRAME_COUNT, LAYERS, PREVIEW_COLUMNS } from './constants.js'
import { parseHexColor } from './color.js'
import { assertFrame } from './document.js'
import { encodePng } from './png.js'
import type { Colors, Layer, Rgba, SpriteDocument, ValidationIssue } from './types.js'

export function validateDocument(doc: SpriteDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  let bodyPixels = 0
  let coloredBodyFrame = -1

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const data = doc.layers.body[frame]
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]
      if (alpha === 0) continue
      bodyPixels++

      if (
        coloredBodyFrame === -1 &&
        (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2])
      ) {
        coloredBodyFrame = frame
      }
    }
  }

  if (bodyPixels === 0) {
    issues.push({
      code: 'body-empty',
      severity: 'error',
      message: 'Body layer is empty',
      layer: 'body'
    })
  }

  if (coloredBodyFrame !== -1) {
    issues.push({
      code: 'body-not-grayscale',
      severity: 'error',
      message: 'Body must be grayscale (R=G=B) for tinting',
      layer: 'body',
      frame: coloredBodyFrame
    })
  }

  for (const layer of LAYERS) {
    let hasPartialAlpha = false
    for (let frame = 0; frame < FRAME_COUNT && !hasPartialAlpha; frame++) {
      const data = doc.layers[layer][frame]
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0 && data[i] < 255) {
          hasPartialAlpha = true
          break
        }
      }
    }

    if (hasPartialAlpha) {
      issues.push({
        code: 'partial-alpha',
        severity: 'warning',
        message: 'Layer has partially transparent pixels',
        layer
      })
    }
  }

  return issues
}

export function applyTint(color: Rgba, tint: string): Rgba {
  return tintPixel(color, parseHexColor(tint))
}

function tintPixel(color: Rgba, tintColor: Rgba): Rgba {
  const alpha = color & 0xff
  const r = Math.round(
    (((color >>> 24) & 0xff) * ((tintColor >>> 24) & 0xff)) / 255
  )
  const g = Math.round(
    (((color >>> 16) & 0xff) * ((tintColor >>> 16) & 0xff)) / 255
  )
  const b = Math.round(
    (((color >>> 8) & 0xff) * ((tintColor >>> 8) & 0xff)) / 255
  )
  return (((r << 24) | (g << 16) | (b << 8) | alpha) >>> 0) as Rgba
}

export function renderFrame(
  doc: SpriteDocument,
  frame: number,
  colors: Colors = doc.colors
): Uint8Array {
  assertFrame(frame)

  const output = new Uint8Array(32 * 32 * 4)
  const tints = Object.fromEntries(
    LAYERS.map((layer) => [layer, parseHexColor(colors[layer])])
  ) as Record<Layer, Rgba>

  for (const layer of LAYERS) {
    const data = doc.layers[layer][frame]
    const tint = tints[layer]

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue
      const color =
        ((data[i] << 24) |
          (data[i + 1] << 16) |
          (data[i + 2] << 8) |
          data[i + 3]) >>>
        0
      blendPixel(output, i, tintPixel(color, tint))
    }
  }

  return output
}

export function renderFramePng(
  doc: SpriteDocument,
  frame: number,
  options: { scale?: number } = {}
): Uint8Array {
  assertFrame(frame)

  const scale = options.scale ?? 4
  const size = 32 * scale
  const data = new Uint8Array(size * size * 4)
  paintChecker(data, size, size, scale)
  blitFrame(doc, frame, data, size, 0, 0, scale)
  return encodePng(data, size, size)
}

export function renderPreviewPng(
  doc: SpriteDocument,
  options: { scale?: number } = {}
): Uint8Array {
  const scale = options.scale ?? 4
  const cell = 32 * scale
  const rows = Math.ceil(FRAME_COUNT / PREVIEW_COLUMNS)
  const width = cell * PREVIEW_COLUMNS
  const height = cell * rows
  const data = new Uint8Array(width * height * 4)
  paintChecker(data, width, height, scale)

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    const column = frame % PREVIEW_COLUMNS
    const row = Math.floor(frame / PREVIEW_COLUMNS)
    blitFrame(doc, frame, data, width, column * cell, row * cell, scale)
  }

  return encodePng(data, width, height)
}

export const CHECKER_LIGHT = '#F4F4F4'
export const CHECKER_DARK = '#D8D8D8'

function paintChecker(
  data: Uint8Array,
  width: number,
  height: number,
  scale: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceX = Math.floor(x / scale)
      const sourceY = Math.floor(y / scale)
      const isLight = (((sourceX >> 3) ^ (sourceY >> 3)) & 1) === 0
      const color = parseHexColor(isLight ? CHECKER_LIGHT : CHECKER_DARK)
      const index = (y * width + x) * 4
      data[index] = (color >>> 24) & 0xff
      data[index + 1] = (color >>> 16) & 0xff
      data[index + 2] = (color >>> 8) & 0xff
      data[index + 3] = 255
    }
  }
}

function blitFrame(
  doc: SpriteDocument,
  frame: number,
  target: Uint8Array,
  targetWidth: number,
  offsetX: number,
  offsetY: number,
  scale: number
): void {
  const pixels = renderFrame(doc, frame)

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const sourceIndex = (y * 32 + x) * 4
      const alpha = pixels[sourceIndex + 3]
      if (alpha === 0) continue

      const color =
        ((pixels[sourceIndex] << 24) |
          (pixels[sourceIndex + 1] << 16) |
          (pixels[sourceIndex + 2] << 8) |
          alpha) >>>
        0

      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const targetX = offsetX + x * scale + dx
          const targetY = offsetY + y * scale + dy
          const targetIndex = (targetY * targetWidth + targetX) * 4
          blendPixel(target, targetIndex, color)
        }
      }
    }
  }
}

function blendPixel(target: Uint8Array, index: number, color: Rgba): void {
  const alpha = (color & 0xff) / 255
  if (alpha <= 0) return

  const sourceR = (color >>> 24) & 0xff
  const sourceG = (color >>> 16) & 0xff
  const sourceB = (color >>> 8) & 0xff

  target[index] = Math.round(sourceR * alpha + target[index] * (1 - alpha))
  target[index + 1] = Math.round(
    sourceG * alpha + target[index + 1] * (1 - alpha)
  )
  target[index + 2] = Math.round(
    sourceB * alpha + target[index + 2] * (1 - alpha)
  )
  target[index + 3] = Math.round(
    255 * alpha + target[index + 3] * (1 - alpha)
  )
}
