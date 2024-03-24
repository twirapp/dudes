import { Assets, BaseTexture, Spritesheet } from 'pixi.js'
import type {
  AssetInitOptions,
  ISpritesheetData,
  ISpritesheetFrameData
} from 'pixi.js'

import { isBase64 } from '../helpers.js'
import { DudesFrameTags } from './texture-provider.js'
import type { DudesTypes } from '../types.js'
import type { TextureProvider } from './texture-provider.js'

export interface SpriteFrameData extends ISpritesheetFrameData {
  duration: number
}

export interface SpriteData extends ISpritesheetData {
  frames: Record<string, SpriteFrameData>
}

export type AssetsLoaderOptions = Omit<AssetInitOptions, 'manifest'>

type SpriteLayer = Map<string, Spritesheet<SpriteData>>

export class SpriteLoader {
  private readonly sprites = new Map<string, SpriteLayer>()

  constructor(private readonly loaderOptions: AssetsLoaderOptions = {}) {}

  getSprite(
    spriteName: string,
    layerType: string
  ): Spritesheet<SpriteData> | undefined {
    return this.sprites.get(spriteName)?.get(layerType)
  }

  async init(): Promise<void> {
    await Assets.init({ ...this.loaderOptions })
  }

  async unloadSprite(spriteName: string): Promise<void> {
    if (!this.sprites.has(spriteName)) return
    await Assets.unloadBundle(spriteName)
    this.sprites.delete(spriteName)
  }

  async loadSprite(spriteData: DudesTypes.SpriteData): Promise<void> {
    const spriteLayers: SpriteLayer = new Map()

    for (const layer of spriteData.layers) {
      const sprite = await this.loadSpriteData(layer)
      await sprite.parse()
      spriteLayers.set(layer.layer, sprite)
    }

    await this.unloadSprite(spriteData.name)
    this.sprites.set(spriteData.name, spriteLayers)
  }

  private async loadSpriteData(
    spriteData: DudesTypes.SpriteLayer
  ): Promise<Spritesheet<SpriteData>> {
    const frames = Object.fromEntries(
      Array.from({ length: 9 }, (_, index) => {
        const frame: SpriteFrameData = {
          frame: { x: index * 32, y: 0, w: 32, h: 32 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
          sourceSize: { w: 32, h: 32 },
          duration: index < 3 ? 300 : 100
        }

        return [`${spriteData.layer}_${index}`, frame]
      })
    )

    const spritesheet: SpriteData = {
      frames,
      meta: {
        format: 'RGBA8888',
        size: { w: 288, h: 32 },
        scale: '1',
        frameTags: [
          {
            name: DudesFrameTags.idle,
            from: 0,
            to: 2,
            direction: 'forward'
          },
          {
            name: DudesFrameTags.jump,
            from: 3,
            to: 3,
            direction: 'forward'
          },
          {
            name: DudesFrameTags.fall,
            from: 4,
            to: 4,
            direction: 'forward'
          },
          {
            name: DudesFrameTags.land,
            from: 5,
            to: 5,
            direction: 'forward'
          },
          {
            name: DudesFrameTags.run,
            from: 6,
            to: 8,
            direction: 'forward'
          }
        ],
        layers: [
          { name: spriteData.layer, opacity: 255, blendMode: 'normal' }]
      }
    }

    if (isBase64(spriteData.src)) {
      const baseTexture = BaseTexture.from(spriteData.src)
      return new Spritesheet(baseTexture, spritesheet)
    }

    const texture = await Assets.load(spriteData.src)
    return new Spritesheet(texture, spritesheet)
  }
}
