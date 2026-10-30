import { decode, encode } from 'fast-png'

import { PackageError } from './errors.js'

export function encodePng(
  data: Uint8Array,
  width: number,
  height: number
): Uint8Array {
  return encode({
    width,
    height,
    data,
    channels: 4,
    depth: 8
  })
}

export interface DecodedImage {
  width: number
  height: number
  data: Uint8Array
}

export function decodePng(bytes: Uint8Array): DecodedImage {
  const png = decode(bytes)

  if (png.depth !== 8) {
    throw new PackageError(`Unsupported PNG depth: ${png.depth}`)
  }

  const raw = png.data as Uint8Array

  if (png.channels === 4) {
    return { width: png.width, height: png.height, data: raw }
  }

  if (png.channels === 3) {
    const data = new Uint8Array(png.width * png.height * 4)
    for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
      data[j] = raw[i]
      data[j + 1] = raw[i + 1]
      data[j + 2] = raw[i + 2]
      data[j + 3] = 255
    }
    return { width: png.width, height: png.height, data }
  }

  throw new PackageError(`Unsupported PNG channels: ${png.channels}`)
}
