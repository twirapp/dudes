import { AnimatedSprite, SCALE_MODES } from 'pixi.js'
import type { FrameObject } from 'pixi.js'

import type { SpriteLoader } from './sprite-loader.js'

export const DudesLayer = {
  Body: 'body',
  Eyes: 'eyes',
  Mouth: 'mouth',
  Hat: 'hat',
  Cosmetics: 'cosmetics',
} as const

export type DudesLayer = typeof DudesLayer[keyof typeof DudesLayer]

export const DudesLayerValues: DudesLayer[] = Object.values(DudesLayer)

export const DudesFrameTag = {
  Idle: 'idle',
  Jump: 'jump',
  Fall: 'fall',
  Land: 'land',
  Walk: 'walk',
} as const

export type DudesFrameTag = typeof DudesFrameTag[keyof typeof DudesFrameTag]

export const DudesFrameTagValues: DudesFrameTag[] = Object.values(DudesFrameTag)

export type DudeFrameObject = Record<string, FrameObject[]>

export class TextureProvider {
  private readonly textures = new Map<string, DudeFrameObject>()

  constructor(private readonly assetsLoader: SpriteLoader) {}

  unloadTextures(spriteName: string): void {
    for (const layer of DudesLayerValues) {
      for (const frameTag of DudesFrameTagValues) {
        const spriteKey = this.getTextureKey(spriteName, layer, frameTag)
        this.textures.delete(spriteKey)
      }
    }
  }

  private getTextureKey(
    spriteName: string,
    layer: string,
    frameTag: string,
  ): string {
    return `${spriteName}.${layer}.${frameTag}`
  }

  private getAnimatedTexture(
    spriteKey: string,
    layer: string,
  ): AnimatedSprite | null {
    const textures = this.textures.get(spriteKey)
    if (textures) return this.textureToAnimatedSprite(textures, layer)
    return null
  }

  private textureToAnimatedSprite(
    textures: DudeFrameObject,
    spriteType: string,
  ): AnimatedSprite {
    const texture = textures[spriteType]
    const sprite = new AnimatedSprite(texture, false)
    sprite.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST
    sprite.name = spriteType
    return sprite
  }

  getTexture(
    spriteName: string,
    frameTag: DudesFrameTag,
  ): Record<string, AnimatedSprite> {
    const sprites: Record<string, AnimatedSprite> = {}

    for (const layer of DudesLayerValues) {
      const spriteKey = this.getTextureKey(spriteName, layer, frameTag)
      const sprite = this.getAnimatedTexture(spriteKey, layer)
      if (sprite) {
        sprites[layer] = sprite
        continue
      }

      const assets = this.assetsLoader.getSprite(spriteName, layer)
      if (!assets) continue

      const layers = assets.data.meta.layers
      const frame = assets.data.meta.frameTags?.find(
        (tag) => tag.name === frameTag,
      )

      if (frame && layers) {
        const textures = Object.fromEntries<FrameObject[]>(
          layers.map((layer) => [layer.name, []]),
        )

        for (let i = frame.from; i <= frame.to; i++) {
          for (const layer in textures) {
            const frameKey = `${layer}_${i}`
            const texture = assets.textures[frameKey]
            if (!texture) continue
            const time = assets.data.frames[frameKey].duration
            textures[layer].push({ texture, time })
          }
        }

        this.textures.set(spriteKey, textures)
        sprites[layer] = this.textureToAnimatedSprite(textures, layer)
      }
    }

    return sprites
  }
}
