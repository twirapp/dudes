import { FRAME_COUNT, FRAME_SIZE, LAYERS, STRIP_WIDTH } from './constants.js'
import { createDocument } from './document.js'
import { PackageError } from './errors.js'
import { parseHexColor } from './color.js'
import { decodePng, encodePng } from './png.js'
import type { Colors, Layer, SpriteDocument } from './types.js'

export function emptyStrip(): Uint8Array {
  return encodePng(
    new Uint8Array(STRIP_WIDTH * FRAME_SIZE * 4),
    STRIP_WIDTH,
    FRAME_SIZE
  )
}

export function documentToStrips(
  doc: SpriteDocument
): Record<Layer, Uint8Array> {
  const strips = {} as Record<Layer, Uint8Array>

  for (const layer of LAYERS) {
    const data = new Uint8Array(STRIP_WIDTH * FRAME_SIZE * 4)

    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const frameData = doc.layers[layer][frame]
      for (let row = 0; row < FRAME_SIZE; row++) {
        const sourceStart = row * FRAME_SIZE * 4
        const targetStart = (row * STRIP_WIDTH + frame * FRAME_SIZE) * 4
        data.set(
          frameData.subarray(sourceStart, sourceStart + FRAME_SIZE * 4),
          targetStart
        )
      }
    }

    strips[layer] = encodePng(data, STRIP_WIDTH, FRAME_SIZE)
  }

  return strips
}

export function documentFromStrips(
  name: string,
  strips: Partial<Record<Layer, Uint8Array>>,
  colors: Partial<Colors> = {}
): SpriteDocument {
  const validColors: Partial<Colors> = {}
  for (const layer of LAYERS) {
    const value = colors[layer]
    if (typeof value !== 'string') continue
    try {
      parseHexColor(value)
      validColors[layer] = value
    } catch {
      // ignore invalid manifest colors and keep the default
    }
  }

  const doc = createDocument(name, validColors)

  for (const layer of LAYERS) {
    const png = strips[layer]
    if (!png) continue

    const image = decodePng(png)

    if (image.width !== STRIP_WIDTH || image.height !== FRAME_SIZE) {
      throw new PackageError(
        `Layer ${layer} must be ${STRIP_WIDTH}x${FRAME_SIZE}, got ${image.width}x${image.height}`
      )
    }

    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const frameData = doc.layers[layer][frame]
      for (let row = 0; row < FRAME_SIZE; row++) {
        const sourceStart = (row * STRIP_WIDTH + frame * FRAME_SIZE) * 4
        const targetStart = row * FRAME_SIZE * 4
        frameData.set(
          image.data.subarray(sourceStart, sourceStart + FRAME_SIZE * 4),
          targetStart
        )
      }
    }
  }

  return doc
}
