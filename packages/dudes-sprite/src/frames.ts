import { FRAME_DURATIONS, FRAME_SIZE, LAYERS, LOOP_DURATION } from './constants.js'
import { assertFrame, assertLayer } from './document.js'
import type { Layer, SpriteDocument } from './types.js'

export function copyFrame(
  doc: SpriteDocument,
  from: number,
  to: number
): void {
  assertFrame(from)
  assertFrame(to)

  for (const layer of LAYERS) {
    doc.layers[layer][to].set(doc.layers[layer][from])
  }
}

export function shiftFrame(
  doc: SpriteDocument,
  frame: number,
  dx: number,
  dy: number
): void {
  assertFrame(frame)

  for (const layer of LAYERS) {
    const data = doc.layers[layer][frame]
    const source = data.slice()
    data.fill(0)

    for (let y = 0; y < FRAME_SIZE; y++) {
      for (let x = 0; x < FRAME_SIZE; x++) {
        const targetX = x + dx
        const targetY = y + dy
        const isInside =
          targetX >= 0 &&
          targetX < FRAME_SIZE &&
          targetY >= 0 &&
          targetY < FRAME_SIZE

        if (!isInside) continue

        const fromIndex = (y * FRAME_SIZE + x) * 4
        const toIndex = (targetY * FRAME_SIZE + targetX) * 4
        data.set(source.subarray(fromIndex, fromIndex + 4), toIndex)
      }
    }
  }
}

export function mirrorFrame(
  doc: SpriteDocument,
  frame: number,
  axis: 'horizontal' | 'vertical'
): void {
  assertFrame(frame)

  for (const layer of LAYERS) {
    const data = doc.layers[layer][frame]
    const source = data.slice()

    for (let y = 0; y < FRAME_SIZE; y++) {
      for (let x = 0; x < FRAME_SIZE; x++) {
        const fromX = axis === 'horizontal' ? FRAME_SIZE - 1 - x : x
        const fromY = axis === 'vertical' ? FRAME_SIZE - 1 - y : y
        const fromIndex = (fromY * FRAME_SIZE + fromX) * 4
        const toIndex = (y * FRAME_SIZE + x) * 4
        data.set(
          source.subarray(fromIndex, fromIndex + 4),
          toIndex
        )
      }
    }
  }
}

export function clearFrame(
  doc: SpriteDocument,
  frame: number,
  layer?: Layer
): void {
  assertFrame(frame)
  if (layer) assertLayer(layer)

  const layers = layer ? [layer] : LAYERS
  for (const currentLayer of layers) {
    doc.layers[currentLayer][frame].fill(0)
  }
}

export function frameAt(elapsedMs: number): number {
  let remaining = ((elapsedMs % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION

  for (let frame = 0; frame < FRAME_DURATIONS.length; frame++) {
    const duration = FRAME_DURATIONS[frame]
    if (remaining < duration) return frame
    remaining -= duration
  }

  return FRAME_DURATIONS.length - 1
}
