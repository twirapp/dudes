import { Container } from 'pixi.js'
import type { IPointData } from 'pixi.js'

import {
  Collider,
  DELTA_TIME,
  Direction,
  ROUND,
  SPRITE_SIZE
} from '../constants.js'
import { isValidColor } from '../helpers.js'
import { DudeSpriteContainer } from './dude-sprite-container.js'
import {
  DudesFrameTags,
  DudesLayers,
  DudesLayersKeys
} from './texture-provider.js'
import type { DudesTypes } from '../types.js'
import type { DudeSettings } from './dude-settings.js'
import type { SpriteLoader } from './sprite-loader.js'
import type {
  DudesLayer,
  DudeSpriteFrameTag,
  TextureProvider
} from './texture-provider.js'

export class Dude {
  readonly view = new Container()

  private colors: Record<DudesLayer, string> = {
    body: '#fff',
    eyes: '#fff',
    mouth: '#fff',
    hat: '#fff',
    cosmetics: '#fff'
  }
  private direction = Direction.Right
  private currentFrameTag?: DudeSpriteFrameTag
  private sprite?: DudeSpriteContainer
  private scale: number

  constructor(
    public readonly config: DudesTypes.DudeConfig,
    private readonly canvas: HTMLCanvasElement,
    private readonly textureProvider: TextureProvider,
    private readonly spriteLoader: SpriteLoader,
    private readonly settings: DudeSettings
  ) {}

  async init(): Promise<void> {
    if (this.sprite) return

    await this.spriteLoader.loadSprite(this.config.sprite)

    this.scale = this.settings.settings.dude.scale
    this.view.y = -(Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale
    this.view.x =
      Math.random() * (this.canvas.clientWidth - SPRITE_SIZE * this.scale) +
      (SPRITE_SIZE / 2) * this.scale

    this.playAnimation(DudesFrameTags.idle)
  }

  async playAnimation(
    frameTag: DudeSpriteFrameTag,
    force = false
  ): Promise<void> {
    const dudeSprite = this.textureProvider.getTexture(
      this.config.sprite.name,
      frameTag
    )
    if (!dudeSprite) return

    if (this.currentFrameTag === frameTag && !force) return
    this.currentFrameTag = frameTag

    if (this.sprite) {
      this.view.removeChild(this.sprite.view)
    }

    this.sprite = new DudeSpriteContainer([
      dudeSprite[DudesLayers.body],
      dudeSprite[DudesLayers.eyes],
      dudeSprite[DudesLayers.mouth],
      dudeSprite[DudesLayers.hat],
      dudeSprite[DudesLayers.cosmetics]
    ])
    this.sprite.view.scale.set(this.direction * this.scale, this.scale)

    for (const layer of DudesLayersKeys) {
      const layerKey = layer as DudesLayer
      this.sprite?.setColor(DudesLayers[layerKey], this.colors[layerKey])
    }

    this.view.addChild(this.sprite.view)
  }

  update(): void {
    const x = this.canvas.clientWidth / 2
    const y =
      this.canvas.clientHeight -
      (Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale

    this.view.position.set(x, y)
    this.sprite?.update((DELTA_TIME / ROUND) * 60)
  }

  updateColor(layer: DudesLayer, color: string): void {
    if (!isValidColor(color) || !this.sprite?.[layer]) return
    this.colors[layer] = color
    this.sprite.setColor(layer, color)
  }

  updateScale(scale?: number, force = false): void {
    if (scale) {
      if (force) {
        this.scale = scale
      } else {
        this.scale += scale
      }
    }

    this.sprite?.view.scale.set(this.direction * this.scale, this.scale)
  }

  async updateSpriteData(spriteData: DudesTypes.SpriteData): Promise<void> {
    await this.spriteLoader.loadSprite(spriteData)
    this.textureProvider.unloadTextures(spriteData.name)
    this.config.sprite = spriteData
    this.playAnimation(DudesFrameTags.idle, true)
  }
}
