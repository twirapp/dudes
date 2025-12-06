import { AnimatedGIF } from '@pixi/gif'
import { Container, Sprite, Texture } from 'pixi.js'

import {
  ALPHA_SPEED,
  DELTA_TIME,
  MOVE_SPEED,
  ROUND,
  SCALE_SPEED
} from '../constants.js'
import { sleep } from '../helpers.js'

type EmoteSprite = Sprite | AnimatedGIF

const emotesCache = new Map<string, EmoteSprite>()

export class DudeEmoteSpitter {
  readonly view = new Container()

  private queueEmotes: EmoteSprite[] = []
  private currentGapTime = 0

  async add(urls: string[]): Promise<void> {
    for (const url of urls) {
      try {
        const emote = await this.loadEmote(url)
        this.addEmoteToQueue(emote)
        await sleep(400)
      } catch (err) {
        console.error(err)
      }
    }
  }

  private addEmoteToQueue(sprite: EmoteSprite): void {
    sprite.anchor.set(0.5, 0.5)
    sprite.scale.set(0, 0)
    this.queueEmotes.push(sprite)
  }

  private async loadEmote(url: string): Promise<EmoteSprite> {
    const emoteFromCache = emotesCache.get(url)
    if (emoteFromCache) {
      if (emoteFromCache instanceof AnimatedGIF) {
        return emoteFromCache.clone()
      }
      return new Sprite(Texture.from(emoteFromCache.texture.baseTexture))
    }

    if (!url.endsWith('.gif')) {
      const sprite = Sprite.from(url)
      emotesCache.set(url, sprite)
      return new Sprite(Texture.from(sprite.texture.baseTexture))
    }

    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const emote = AnimatedGIF.fromBuffer(buffer, { fps: 60 })
    emotesCache.set(url, emote)
    return emote.clone()
  }

  update(): void {
    for (const child of this.view.children) {
      child.position.y -= (DELTA_TIME * MOVE_SPEED) / ROUND
      child.scale.x += (DELTA_TIME * SCALE_SPEED) / ROUND
      child.scale.y += (DELTA_TIME * SCALE_SPEED) / ROUND

      if (child.scale.x >= 2) {
        child.alpha -= (DELTA_TIME * ALPHA_SPEED) / ROUND
      }

      if (child.alpha <= 0) {
        this.view.removeChild(child)
      }
    }

    if (this.currentGapTime >= 0) {
      this.currentGapTime -= DELTA_TIME
    } else {
      if (this.queueEmotes.length > 0) {
        const emote = this.queueEmotes.shift()
        if (!emote) return
        this.view.addChild(emote)
        this.currentGapTime = ROUND
      }
    }
  }
}
