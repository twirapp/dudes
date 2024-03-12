import { AnimatedSprite, SCALE_MODES } from 'pixi.js'
import type { FrameObject } from 'pixi.js'

import { assetsLoader } from './assets-loader.js'

export const DudesLayers = {
  body: 'body',
  eyes: 'eyes',
  mouth: 'mouth',
  hat: 'hat',
  cosmetics: 'cosmetics'
} as const
export const DudesLayersKeys = Object.keys(DudesLayers)
export type DudesLayer = keyof typeof DudesLayers

export const DudesFrameTags = {
  idle: 'idle',
  jump: 'jump',
  fall: 'fall',
  land: 'land',
  run: 'run'
} as const
export const DudeFrameTagsKeys = Object.keys(DudesFrameTags)
export type DudeSpriteFrameTag = keyof typeof DudesFrameTags

export type DudeFrameObject = Record<string, FrameObject[]>

class SpriteProvider {
  private readonly spriteTextures = new Map<string, DudeFrameObject>()

  unloadTextures(spriteName: string): void {
    for (const layer of DudesLayersKeys) {
      for (const frameTag of DudeFrameTagsKeys) {
        const spriteKey = this.getSpriteKey(spriteName, layer, frameTag)
        this.spriteTextures.delete(spriteKey)
      }
    }
  }

  private getSpriteKey(
    spriteName: string,
    layer: string,
    frameTag: string
  ): string {
    return `${spriteName}.${layer}.${frameTag}`
  }

  private getAnimatedSprite(spriteKey: string, layer: string) {
    const textures = this.spriteTextures.get(spriteKey)
    if (textures) return this.texturesToSprites(textures, layer)
    return null
  }

  private texturesToSprites(textures: DudeFrameObject, spriteType: string) {
    const texture = textures[spriteType]
    const sprite = new AnimatedSprite(texture, false)
    sprite.texture.baseTexture.scaleMode = SCALE_MODES.NEAREST
    sprite.name = spriteType
    return sprite
  }

  getSprite(spriteName: string, frameTag: DudeSpriteFrameTag) {
    const sprites: Record<string, AnimatedSprite> = {}

    for (const layer of DudesLayersKeys) {
      const spriteKey = this.getSpriteKey(spriteName, layer, frameTag)
      const sprite = this.getAnimatedSprite(spriteKey, layer)
      if (sprite) {
        sprites[layer] = sprite
        continue
      }

      const assets = assetsLoader.getAssets(spriteName, layer)
      if (!assets) continue

      const layers = assets.data.meta.layers
      const frame = assets.data.meta.frameTags?.find(
        (tag) => tag.name === frameTag
      )

      if (frame && layers) {
        const textures = Object.fromEntries<FrameObject[]>(
          layers.map((layer) => [layer.name, []])
        )

        for (let i = frame.from; i <= frame.to; i++) {
          for (const layer in textures) {
            const frameKey = layer + '_' + i
            const texture = assets.textures[frameKey]
            if (!texture) continue
            const time = assets.data.frames[frameKey].duration
            textures[layer].push({ texture, time })
          }
        }

        this.spriteTextures.set(spriteKey, textures)
        sprites[layer] = this.texturesToSprites(textures, layer)
      }
    }

    return sprites
  }
}

export const spriteProvider = new SpriteProvider()
