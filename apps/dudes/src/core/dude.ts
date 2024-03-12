import { Container } from 'pixi.js'
import type { IPointData } from 'pixi.js'

import { deleteDude } from '../composables/use-dudes.js'
import { dudesSettings } from '../composables/use-settings.js'
import {
  Collider,
  DELTA_TIME,
  Direction,
  ROUND,
  SPRITE_SIZE
} from '../constants.js'
import { isValidColor } from '../helpers.js'
import { assetsLoader } from './assets-loader.js'
import { DudeEmoteSpitter } from './dude-emote-spitter.js'
import { DudeMessageBox } from './dude-message-box.js'
import { DudeNameBox } from './dude-name-box.js'
import { DudeSpriteContainer } from './dude-sprite-container.js'
import { Sound, soundsLoader } from './sounds-loader.js'
import {
  DudesFrameTags,
  DudesLayers,
  DudesLayersKeys,
  spriteProvider
} from './sprite-provider.js'
import type { DudesTypes } from '../types.js'
import type { DudesLayer, DudeSpriteFrameTag } from './sprite-provider.js'

export class Dude {
  readonly view = new Container()

  private colors: Record<DudesLayer, string> = {
    body: dudesSettings.value.dude.bodyColor,
    eyes: '#FFF',
    mouth: '#FFF',
    hat: '#FFF',
    cosmetics: '#FFF'
  }
  private direction: number
  private currentFrameTag?: DudeSpriteFrameTag

  private sprite?: DudeSpriteContainer
  private nameBox: DudeNameBox
  private messageBox: DudeMessageBox
  private emoteSpitter: DudeEmoteSpitter

  private velocity: IPointData = {
    x: 0,
    y: 0
  }

  private landAnimationTime: number | null = null
  private maxLandAnimationTime = 200

  private idleAnimationTime?: number
  private idleAnimationMaxTime?: number

  private isLeaving = false
  private isGrowing = false
  private growingTime: number

  private currentLifeTime = dudesSettings.value.dude.maxLifeTime
  private maxOpacityTime = 5000
  private currentOpacityTime = this.maxOpacityTime
  private scale = dudesSettings.value.dude.scale

  constructor(public readonly config: DudesTypes.DudeConfig) {
    this.jump = this.jump.bind(this)
  }

  async init(): Promise<void> {
    if (this.sprite) return

    await assetsLoader.load(this.config.sprite)

    this.view.y = -(Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale
    this.view.x =
      Math.random() * (window.innerWidth - SPRITE_SIZE * this.scale) +
      (SPRITE_SIZE / 2) * this.scale

    this.nameBox = new DudeNameBox(this.config.name, this.config.styles?.name)
    this.messageBox = new DudeMessageBox(this.config.styles?.message)
    this.emoteSpitter = new DudeEmoteSpitter()

    this.view.sortableChildren = true
    this.view.addChild(this.nameBox.view)
    this.view.addChild(this.messageBox.view)
    this.view.addChild(this.emoteSpitter.view)

    this.updateDirection()
    this.updateIdleAnimationTime({ time: performance.now() })

    this.playAnimation(DudesFrameTags.idle)
  }

  jump(): void {
    if (this.currentFrameTag !== DudesFrameTags.jump) {
      this.velocity.x = this.direction * 100
      this.velocity.y = -300

      this.playAnimation(DudesFrameTags.jump)
      this.updateLifeTime()
      return
    }

    requestAnimationFrame(this.jump)
  }

  leave(): void {
    this.updateIdleAnimationTime()
    this.playAnimation(DudesFrameTags.run)

    if (!this.isLeaving) {
      this.isLeaving = true
      this.updateLifeTime({
        lifeTime: Number.MAX_SAFE_INTEGER,
        opacityTime: ROUND
      })
    }
  }

  addMessage(message: string): void {
    this.messageBox.add(message)
    if (this.isLeaving) return
    this.updateLifeTime()
  }

  addEmotes(emotes: string[]): void {
    if (!dudesSettings.value.emotes.enabled) return
    this.emoteSpitter.add(emotes)
    this.updateLifeTime()
  }

  grow(): void {
    if (this.isGrowing) return
    this.growingTime = dudesSettings.value.dude.growTime
    this.isGrowing = true
    this.updateLifeTime({ lifeTime: this.currentLifeTime + this.growingTime })
  }

  async playAnimation(
    frameTag: DudeSpriteFrameTag,
    force = false
  ): Promise<void> {
    const dudeSprite = spriteProvider.getSprite(
      this.config.sprite.name,
      frameTag
    )
    if (!dudeSprite) return

    if (this.currentFrameTag === frameTag && !force) return
    this.currentFrameTag = frameTag

    if (this.sprite) {
      this.view.removeChild(this.sprite.view)
    }

    if (
      dudesSettings.value.sounds.enabled &&
      frameTag === DudesFrameTags.jump
    ) {
      soundsLoader.play(Sound.Jump, dudesSettings.value.sounds.volume)
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
    const now = performance.now()

    if (
      this.landAnimationTime &&
      now - this.landAnimationTime > this.maxLandAnimationTime
    ) {
      this.playAnimation(DudesFrameTags.idle)
      this.landAnimationTime = null
    }

    if (this.isLeaving) {
      this.leave()
    }

    if (
      this.idleAnimationTime &&
      this.idleAnimationMaxTime &&
      now - this.idleAnimationTime > this.idleAnimationMaxTime &&
      (this.currentFrameTag === DudesFrameTags.run ||
        this.currentFrameTag === DudesFrameTags.idle)
    ) {
      if (this.currentFrameTag === DudesFrameTags.idle) {
        this.playAnimation(DudesFrameTags.run)
      } else {
        this.playAnimation(DudesFrameTags.idle)
      }

      this.updateIdleAnimationTime({ time: now })
    }

    this.velocity.y =
      this.velocity.y + (dudesSettings.value.dude.gravity * DELTA_TIME) / ROUND

    const newPosition = {
      x: this.view.position.x + (this.velocity.x * DELTA_TIME) / ROUND,
      y: this.view.position.y + (this.velocity.y * DELTA_TIME) / ROUND
    }

    if (
      newPosition.y +
        (Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale >
      window.innerHeight
    ) {
      this.velocity.y = 0
      this.velocity.x = 0

      newPosition.y =
        window.innerHeight -
        (Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale

      if (this.currentFrameTag === DudesFrameTags.fall) {
        this.playAnimation(DudesFrameTags.land)
        this.landAnimationTime = now
      }
    }

    this.view.position.set(newPosition.x, newPosition.y)

    if (this.velocity.y > 0) {
      this.playAnimation(DudesFrameTags.fall)
    }

    const width = window.innerWidth
    const isCollidingMore =
      this.view.x + (Collider.Width / 2) * this.scale >= width
    const isCollidingLess = this.view.x - (Collider.Width / 2) * this.scale <= 0

    if (this.isGrowing) {
      if (this.scale <= dudesSettings.value.dude.growMaxScale) {
        this.updateScale(0.1)

        if (isCollidingMore) {
          this.updateDirection(Direction.Right)
        }

        if (isCollidingLess) {
          this.updateDirection(Direction.Left)
        }
      }

      this.growingTime -= DELTA_TIME
    }

    if (this.growingTime <= 0 && this.scale > dudesSettings.value.dude.scale) {
      this.isGrowing = false
      this.updateScale(-0.01)
    }

    if (newPosition.x < 0 || newPosition.x > width) {
      this.currentLifeTime = 0
    }

    if (isCollidingMore || isCollidingLess) {
      if (!this.isLeaving) {
        this.direction = -this.direction
      }

      this.velocity.x = -this.velocity.x
      this.view.position.x += (this.direction * DELTA_TIME * 60) / ROUND

      if (Math.random() >= 0.7) {
        this.updateScale()
      }
    }

    if (
      this.currentFrameTag !== DudesFrameTags.idle ||
      (this.isGrowing && this.scale < dudesSettings.value.dude.growMaxScale)
    ) {
      this.view.position.x += (this.direction * DELTA_TIME * 60) / ROUND
    }

    if (this.currentLifeTime > 0) {
      this.currentLifeTime -= DELTA_TIME
    } else {
      if (this.currentOpacityTime > 0) {
        this.currentOpacityTime -= DELTA_TIME
        this.view.alpha = this.currentOpacityTime / this.maxOpacityTime
      } else {
        deleteDude(this)
      }
    }

    this.sprite?.update((DELTA_TIME / ROUND) * 60)
    this.emoteSpitter.update()

    this.emoteSpitter.view.position.y =
      this.messageBox.view.position.y - this.messageBox.view.height

    this.messageBox.update()
    this.messageBox.view.position.y =
      this.nameBox.view.position.y - this.nameBox.view.height - 2 * this.scale

    this.nameBox.update(this.scale)
  }

  updateDirection(direction?: number): void {
    this.direction =
      direction ?? Math.random() > 0.5 ? Direction.Right : Direction.Left
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

  updateIdleAnimationTime(
    { time, maxTime }: { time: number; maxTime?: number } = {
      time: Number.MAX_SAFE_INTEGER
    }
  ): void {
    this.idleAnimationTime = time
    this.idleAnimationMaxTime = maxTime ?? Math.random() * 5000
  }

  async updateSpriteData(spriteData: DudesTypes.SpriteData): Promise<void> {
    await assetsLoader.load(spriteData)
    this.config.sprite = spriteData
    this.playAnimation(DudesFrameTags.idle, true)
  }

  updateLifeTime({
    lifeTime,
    opacityTime
  }: { lifeTime?: number; opacityTime?: number } = {}): void {
    this.currentLifeTime = lifeTime ?? dudesSettings.value.dude.maxLifeTime
    this.currentOpacityTime = opacityTime ?? this.maxOpacityTime
    this.view.alpha = 1
  }
}
