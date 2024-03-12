import { Assets, BaseTexture, Spritesheet } from 'pixi.js'
import type {
  AssetInitOptions,
  ISpritesheetData,
  ISpritesheetFrameData
} from 'pixi.js'

import { isBase64 } from '../helpers.js'
import { DudesFrameTags, spriteProvider } from './sprite-provider.js'
import type { DudesTypes } from '../types.js'

export interface SpriteFrameData extends ISpritesheetFrameData {
  duration: number
}

export interface SpriteData extends ISpritesheetData {
  frames: Record<string, SpriteFrameData>
}

export type AssetsLoaderOptions = Omit<AssetInitOptions, 'manifest'>

async function loadSprite(spriteData: DudesTypes.SpriteLayer) {
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

type SpriteLayer = Record<string, Spritesheet<SpriteData>>
type Bundles = Record<string, SpriteLayer>

export class AssetsLoader {
  private bundles: Bundles = {}

  getAssets(
    spriteName: string,
    layerType: string
  ): Spritesheet<SpriteData> | undefined {
    return this.bundles?.[spriteName]?.[layerType]
  }

  async init(loadOptions: AssetsLoaderOptions = {}): Promise<void> {
    await Assets.init({ ...loadOptions })
  }

  async unload(spriteName: string): Promise<void> {
    if (!this.bundles[spriteName]) return
    await Assets.unloadBundle(spriteName)
    spriteProvider.unloadTextures(spriteName)
    delete this.bundles[spriteName]
  }

  async load(spriteData: DudesTypes.SpriteData): Promise<void> {
    const loadedSpriteLayers: SpriteLayer = {}

    for (const layer of spriteData.layers) {
      const sprite = await loadSprite(layer)
      await sprite.parse()
      loadedSpriteLayers[layer.layer] = sprite
    }

    if (this.bundles[spriteData.name]) {
      await this.unload(spriteData.name)
    }

    this.bundles[spriteData.name] = loadedSpriteLayers
  }
}

export const assetsLoader = new AssetsLoader()
