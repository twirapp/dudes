import { randomNum, rgbToHex } from '@zero-dependency/utils'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomRgbColor(): string {
  return rgbToHex({
    r: randomNum(0, 255),
    g: randomNum(0, 255),
    b: randomNum(0, 255)
  })
}

const CHAR_RANGE = {
  emoticons: [0x1f600, 0x1f64f],
  food: [0x1f32d, 0x1f37f],
  animals: [0x1f400, 0x1f4d3],
  expressions: [0x1f910, 0x1f92f]
}

type NamedCharRange = keyof typeof CHAR_RANGE

export function randomEmoji(range: NamedCharRange): string {
  const [max, min] = CHAR_RANGE[range]
  const codePoint = Math.floor(Math.random() * (max - min) + min)
  return String.fromCodePoint(codePoint)
}
