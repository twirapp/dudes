export function isBase64(str: string): boolean {
  return str.startsWith('data:image/png;base64')
}

const option = new Option()

export function isValidColor(color: string): boolean {
  option.style.color = color
  return !(option.style.color === '' || color === 'transparent')
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* https://github.com/voodoocreation/ts-deepmerge */
interface IObject {
  [key: string]: any
  length?: never
}

type IUnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

const isObject = (obj: any) => {
  if (typeof obj === 'object' && obj !== null) {
    if (typeof Object.getPrototypeOf === 'function') {
      const prototype = Object.getPrototypeOf(obj)
      return prototype === Object.prototype || prototype === null
    }

    return Object.prototype.toString.call(obj) === '[object Object]'
  }

  return false
}

const PROTECTED_KEYS = [
  '__proto__',
  'constructor',
  'prototype'
]

export function deepMerge<T extends IObject[]>(
  ...objects: T
): IUnionToIntersection<T[number]> {
  return objects.reduce((result, current) => {
    Object.keys(current).forEach((key) => {
      if (PROTECTED_KEYS.includes(key)) {
        return
      }

      if (Array.isArray(result[key]) && Array.isArray(current[key])) {
        result[key] = false
          ? Array.from(new Set((result[key] as unknown[]).concat(current[key])))
          : current[key]
      } else if (isObject(result[key]) && isObject(current[key])) {
        result[key] = deepMerge(result[key] as IObject, current[key] as IObject)
      } else {
        result[key] = current[key]
      }
    })

    return result
  }, {}) as any
}
