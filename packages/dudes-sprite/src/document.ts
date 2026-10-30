import { DEFAULT_COLORS, FRAME_COUNT, FRAME_SIZE, LAYERS } from './constants.js'
import { TRANSPARENT } from './color.js'
import type { Colors, Layer, Rgba, SpriteDocument } from './types.js'

const FRAME_BYTES = FRAME_SIZE * FRAME_SIZE * 4

export function createFrame(): Uint8Array {
  return new Uint8Array(FRAME_BYTES)
}

export function createDocument(
  name: string,
  colors: Partial<Colors> = {}
): SpriteDocument {
  const layers = Object.fromEntries(
    LAYERS.map((layer) => [
      layer,
      Array.from({ length: FRAME_COUNT }, () => createFrame())
    ])
  ) as Record<Layer, Uint8Array[]>

  return {
    name,
    colors: { ...DEFAULT_COLORS, ...colors },
    layers
  }
}

export function cloneDocument(doc: SpriteDocument): SpriteDocument {
  const layers = Object.fromEntries(
    LAYERS.map((layer) => [
      layer,
      doc.layers[layer].map((frame) => frame.slice())
    ])
  ) as Record<Layer, Uint8Array[]>

  return {
    name: doc.name,
    colors: { ...doc.colors },
    layers
  }
}

export function assertLayer(layer: string): asserts layer is Layer {
  if (!LAYERS.includes(layer as Layer)) {
    throw new RangeError('unknown layer')
  }
}

export function assertFrame(frame: number): void {
  if (!Number.isInteger(frame) || frame < 0 || frame >= FRAME_COUNT) {
    throw new RangeError('frame must be 0..8')
  }
}

export function assertCoord(x: number, y: number): void {
  if (!Number.isInteger(x) || x < 0 || x >= FRAME_SIZE) {
    throw new RangeError('x must be 0..31')
  }

  if (!Number.isInteger(y) || y < 0 || y >= FRAME_SIZE) {
    throw new RangeError('y must be 0..31')
  }
}

export function getPixel(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x: number,
  y: number
): Rgba {
  assertLayer(layer)
  assertFrame(frame)
  assertCoord(x, y)

  const data = doc.layers[layer][frame]
  const index = (y * FRAME_SIZE + x) * 4
  return (
    ((data[index] << 24) |
      (data[index + 1] << 16) |
      (data[index + 2] << 8) |
      data[index + 3]) >>>
    0
  )
}

export function setPixel(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x: number,
  y: number,
  color: Rgba
): void {
  assertLayer(layer)
  assertFrame(frame)
  assertCoord(x, y)
  writePixel(doc.layers[layer][frame], x, y, color)
}

/** Writes a pixel without bounds checks — for shape rasterizers that clip. */
export function writePixel(
  data: Uint8Array,
  x: number,
  y: number,
  color: Rgba
): void {
  const index = (y * FRAME_SIZE + x) * 4
  data[index] = (color >>> 24) & 0xff
  data[index + 1] = (color >>> 16) & 0xff
  data[index + 2] = (color >>> 8) & 0xff
  data[index + 3] = color & 0xff
}

export function readPixel(data: Uint8Array, x: number, y: number): Rgba {
  const index = (y * FRAME_SIZE + x) * 4
  return (
    ((data[index] << 24) |
      (data[index + 1] << 16) |
      (data[index + 2] << 8) |
      data[index + 3]) >>>
    0
  )
}

export function isInside(x: number, y: number): boolean {
  return x >= 0 && x < FRAME_SIZE && y >= 0 && y < FRAME_SIZE
}

export { TRANSPARENT }
