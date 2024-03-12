import type { AssetsLoaderOptions } from './core/assets-loader.js'
import type { Dude } from './core/dude.js'
import type { SoundAsset, SoundType } from './core/sounds-loader.js'
import type { DudesLayer, DudeSpriteFrameTag } from './core/sprite-provider.js'

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
      ? RecursivePartial<T[P]>
      : T[P]
}

export interface DudesMethods {
  dudes: Map<string, Dude>
  initDudes: () => Promise<void>
  getDude: (id: string) => Dude | undefined
  createDude: (config: DudesTypes.DudeConfig) => Promise<Dude>
  removeDude: (id: string) => void
  removeAllDudes: () => void
}

export namespace DudesTypes {
  export interface DudeStyles {
    /**
     * @default 1800000 // FIXED_ROUND * 60 * 30 - 30 minutes
     */
    maxLifeTime: number

    /**
     * @default 400
     */
    gravity: number

    /**
     * @default '#969696'
     */
    bodyColor: string

    /**
     * @default 4
     */
    scale: number

    /**
     * @default 1000 * 60 * 5 // 5 minutes
     */
    growTime: number

    /**
     * @default 20
     */
    growMaxScale: number
  }

  export type DudeSounds = {
    /**
     * @default true
     */
    enabled: boolean
    /**
     * @default 0.01 // 1%
     */
    volume: number
  }

  export type IndividualDudeStyles = Partial<{
    message: IndividualMessageBoxStyles
    name: IndividualNameBoxStyles
  }>

  export interface MessageBoxStyles {
    /**
     * @default true
     */
    enabled: boolean

    /**
     * @default '#EEEEEE'
     */
    boxColor: string

    /**
     * @default '#333333'
     */
    fill: string

    /**
     * @default 20
     */
    fontSize: number

    /**
     * @default 'Arial'
     */
    fontFamily: string

    /**
     * @default 10
     */
    borderRadius: number

    /**
     * @default 10
     */
    padding: number

    /**
     * @default 5_000
     */
    showTime: number
  }

  export type IndividualMessageBoxStyles = Partial<
    Pick<MessageBoxStyles, 'boxColor' | 'fill'>
  >

  export interface NameBoxStyles {
    /**
     * @default true
     */
    enabled: boolean

    // font
    /**
     * @default 'Arial'
     */
    fontFamily: string

    /**
     * @default 18
     */
    fontSize: number

    /**
     * Available values: 'normal', 'italic', 'oblique'
     * @default 'normal'
     */
    fontStyle: string

    /**
     * Available values: 'normal', 'small-caps'
     * @default 'normal'
     */
    fontVariant: string

    /**
     * Available values: 100, 200, 300, 400, 500, 600, 700, 800, 900
     * @default 400
     */
    fontWeight: number

    // fill
    /**
     * @default '#FFFFFF'
     */
    fill: string | string[]

    /**
     * Available values: vertical - 0, horizontal - 1
     * @default 0
     */
    fillGradientType: number

    /**
     * Minimum value is 0, maximum value is 1
     * @default [0]
     */
    fillGradientStops: number[]

    // stroke
    /**
     * @default '#000000'
     */
    stroke: string

    /**
     * @default 4
     */
    strokeThickness: number

    /**
     * Available values: 'round', 'bevel', 'miter'
     * @default 'round'
     */
    lineJoin: string

    // drop shadow
    /**
     * @default false
     */
    dropShadow: boolean

    /**
     * @default 1
     */
    dropShadowAlpha: number

    /**
     * Recommended range value is 0 to Math.PI * 2
     * @default 0
     */
    dropShadowAngle: number

    /**
     * @default 0.1
     */
    dropShadowBlur: number

    /**
     * @default '#3EC7D9'
     */
    dropShadowColor: string

    /**
     * @default 10
     */
    dropShadowDistance: number
  }

  export type IndividualNameBoxStyles = Partial<
    Pick<
      NameBoxStyles,
      | 'stroke'
      | 'strokeThickness'
      | 'fill'
      | 'fillGradientType'
      | 'fillGradientStops'
    >
  >

  export interface EmotesStyles {
    enabled: boolean
  }

  export interface DudeConfig {
    id: string
    name: string
    sprite: SpriteData
    styles?: IndividualDudeStyles
  }

  export interface SpriteData {
    name: string
    layers: SpriteLayer[]
  }

  export interface SpriteLayer {
    layer: DudesLayer
    src: string
  }
}

export type DudesStyles = RecursivePartial<{
  dude: DudesTypes.DudeStyles
  sounds: DudesTypes.DudeSounds
  message: DudesTypes.MessageBoxStyles
  name: DudesTypes.NameBoxStyles
  emotes: DudesTypes.EmotesStyles
}>

export type {
  Dude,
  DudesLayer,
  SoundAsset,
  SoundType,
  DudeSpriteFrameTag,
  AssetsLoaderOptions
}
