import type { Dude } from './core/dude.js'
import type { AssetsLoaderOptions } from './core/sprite-loader.js'
import type { DudesLayer, DudeSpriteFrameTag } from './core/texture-provider.js'
import type { RecursivePartial } from './helpers.js'

export namespace DudesTypes {
  export interface DudeStyles {
    /**
     * @default 1800000 // FIXED_ROUND * 60 * 30 - 30 minutes
     */
    maxLifeTime: number

    /**
     * @default 4
     */
    scale: number
  }

  export interface DudeConfig {
    id: string
    name: string
    sprite: SpriteData
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

export type DudePartialSettings = RecursivePartial<{
  dude: DudesTypes.DudeStyles
}>

export type { Dude, DudesLayer, DudeSpriteFrameTag, AssetsLoaderOptions }
