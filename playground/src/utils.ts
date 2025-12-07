import { randomNum, rgbToHex } from '@zero-dependency/utils'

export function randomRgbColor(): string {
  return rgbToHex({
    r: randomNum(0, 255),
    g: randomNum(0, 255),
    b: randomNum(0, 255),
  })
}

const CHAR_RANGE = {
  emoticons: [0x1F600, 0x1F64F],
  food: [0x1F32D, 0x1F37F],
  animals: [0x1F400, 0x1F4D3],
  expressions: [0x1F910, 0x1F92F],
}

type NamedCharRange = keyof typeof CHAR_RANGE

export function randomEmoji(range: NamedCharRange): string {
  const [max, min] = CHAR_RANGE[range]
  const codePoint = Math.floor(Math.random() * (max - min) + min)
  return String.fromCodePoint(codePoint)
}
