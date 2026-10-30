import {
  assertFrame,
  assertLayer,
  isInside,
  readPixel,
  writePixel
} from './document.js'
import type { Layer, Rgba, SpriteDocument } from './types.js'

export function drawLine(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: Rgba
): void {
  assertLayer(layer)
  assertFrame(frame)
  const data = doc.layers[layer][frame]
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let error = dx + dy

  while (true) {
    if (isInside(x, y)) writePixel(data, x, y, color)
    if (x === x1 && y === y1) break
    const doubled = 2 * error
    if (doubled >= dy) {
      error += dy
      x += sx
    }
    if (doubled <= dx) {
      error += dx
      y += sy
    }
  }
}

export function drawRect(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgba,
  filled = true
): void {
  assertLayer(layer)
  assertFrame(frame)
  const data = doc.layers[layer][frame]
  const right = x + width - 1
  const bottom = y + height - 1

  for (let py = y; py <= bottom; py++) {
    for (let px = x; px <= right; px++) {
      const isBorder = px === x || px === right || py === y || py === bottom
      if (!filled && !isBorder) continue
      if (isInside(px, py)) writePixel(data, px, py, color)
    }
  }
}

export function drawEllipse(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color: Rgba,
  filled = true
): void {
  assertLayer(layer)
  assertFrame(frame)
  const data = doc.layers[layer][frame]
  const radiusX = width / 2
  const radiusY = height / 2
  const centerX = x + radiusX
  const centerY = y + radiusY
  const innerX = Math.max(radiusX - 1, 0)
  const innerY = Math.max(radiusY - 1, 0)

  for (let py = y; py < y + height; py++) {
    for (let px = x; px < x + width; px++) {
      const dx = px + 0.5 - centerX
      const dy = py + 0.5 - centerY
      if (!insideEllipse(dx, dy, radiusX, radiusY)) continue
      if (!filled && insideEllipse(dx, dy, innerX, innerY)) continue
      if (isInside(px, py)) writePixel(data, px, py, color)
    }
  }
}

function insideEllipse(
  dx: number,
  dy: number,
  radiusX: number,
  radiusY: number
): boolean {
  if (radiusX <= 0 || radiusY <= 0) return false
  return (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY) <= 1
}

export function fillArea(
  doc: SpriteDocument,
  layer: Layer,
  frame: number,
  x: number,
  y: number,
  color: Rgba
): void {
  assertLayer(layer)
  assertFrame(frame)
  if (!isInside(x, y)) return

  const data = doc.layers[layer][frame]
  const target = readPixel(data, x, y)
  if (target === color) return

  const stack: [number, number][] = [[x, y]]
  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    if (!isInside(cx, cy)) continue
    if (readPixel(data, cx, cy) !== target) continue

    writePixel(data, cx, cy, color)
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }
}
