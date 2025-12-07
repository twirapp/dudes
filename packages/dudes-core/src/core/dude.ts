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
import { DudeEmoteSpitter } from './dude-emote-spitter.js'
import { DudeMessageBox } from './dude-message-box.js'
import { DudeNameBox } from './dude-name-box.js'
import { DudeSpriteContainer } from './dude-sprite-container.js'
import { Sound } from './sounds-loader.js'
import {
  DudesFrameTag,
  DudesLayer,
  DudesLayerValues,
  TextureProvider
} from './texture-provider.js'
import type { DudesTypes } from '../types.js'
import type { DudeSettings } from './dude-settings.js'
import type { SoundsLoader } from './sounds-loader.js'
import type { SpriteLoader } from './sprite-loader.js'

export class Dude {
  readonly view = new Container()

  private colors: Record<DudesLayer, string>
  private direction: number
  private currentFrameTag?: DudesFrameTag

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

  private currentLifeTime: number
  private maxOpacityTime = 5000
  private currentOpacityTime = this.maxOpacityTime
  private scale: number

  private onRemoveCallbacks: (() => void)[] = []

  constructor(
    public readonly config: DudesTypes.DudeConfig,
    private readonly textureProvider: TextureProvider,
    private readonly spriteLoader: SpriteLoader,
    private readonly soundsLoader: SoundsLoader,
    private readonly settings: DudeSettings
  ) {
    this.jump = this.jump.bind(this)
  }

  async init(): Promise<void> {
    if (this.sprite) return

    await this.spriteLoader.loadSprite(this.config.sprite)

    this.colors = {
      body: this.settings.settings.dude.bodyColor,
      eyes: '#FFF',
      mouth: '#FFF',
      hat: '#FFF',
      cosmetics: '#FFF'
    }
    this.currentLifeTime = this.settings.settings.dude.maxLifeTime
    this.scale = this.settings.settings.dude.scale

    this.view.y = -(Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale
    this.view.x =
      Math.random() * (window.innerWidth - SPRITE_SIZE * this.scale) +
      (SPRITE_SIZE / 2) * this.scale

    this.nameBox = new DudeNameBox(
      this.config.name,
      this.settings,
      this.config.styles?.name
    )
    this.messageBox = new DudeMessageBox(
      this.settings,
      this.config.styles?.message
    )
    this.emoteSpitter = new DudeEmoteSpitter()

    this.view.addChild(this.nameBox.view)
    this.view.addChild(this.messageBox.view)
    this.view.addChild(this.emoteSpitter.view)

    this.updateDirection()
    this.updateIdleAnimationTime({ time: performance.now() })

    this.playAnimation(DudesFrameTag.Idle)
  }

  jump(): void {
    if (this.currentFrameTag !== DudesFrameTag.Jump) {
      this.velocity.x = this.direction * 100
      this.velocity.y = -300

      this.playAnimation(DudesFrameTag.Jump)
      this.updateLifeTime()
      return
    }

    requestAnimationFrame(this.jump)
  }

  leave(): void {
    this.updateIdleAnimationTime()
    this.playAnimation(DudesFrameTag.Walk)

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
    if (!this.settings.settings.emotes.enabled) return
    this.emoteSpitter.add(emotes)
    this.updateLifeTime()
  }

  grow(): void {
    if (this.isGrowing) return
    this.growingTime = this.settings.settings.dude.growTime
    this.isGrowing = true
    this.updateLifeTime({ lifeTime: this.currentLifeTime + this.growingTime })
  }

  async playAnimation(
    frameTag: DudesFrameTag,
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

    if (
      this.settings.settings.sounds.enabled &&
      frameTag === DudesFrameTag.Jump
    ) {
      this.soundsLoader.play(Sound.Jump, this.settings.settings.sounds.volume)
    }

    this.sprite = new DudeSpriteContainer([
      dudeSprite[DudesLayer.Body],
      dudeSprite[DudesLayer.Eyes],
      dudeSprite[DudesLayer.Mouth],
      dudeSprite[DudesLayer.Hat],
      dudeSprite[DudesLayer.Cosmetics]
    ])
    this.sprite.view.scale.set(this.direction * this.scale, this.scale)

    for (const layer of DudesLayerValues) {
      this.sprite?.setColor(layer, this.colors[layer])
    }

    this.view.addChild(this.sprite.view)
  }

  update(): void {
    const now = performance.now()

    this.updateLandAnimation(now)
    this.updateLeavingState()
    this.updateIdleRunAnimation(now)
    this.updateGravity()

    const currentPosition = this.getCurrentPosition()
    this.handleGroundCollision(currentPosition, now)
    this.view.position.set(currentPosition.x, currentPosition.y)

    this.handleFalling()
    this.handleGrowth()
    this.handleShrinking()
    this.handleScreenExit(currentPosition)
    this.handleWallCollision()
    this.updateMovement()
    this.updateLifeCycle()
    this.updateChildComponents()
  }

  private updateLandAnimation(now: number): void {
    if (
      this.landAnimationTime &&
      now - this.landAnimationTime > this.maxLandAnimationTime
    ) {
      this.playAnimation(DudesFrameTag.Idle)
      this.landAnimationTime = null
    }
  }

  private updateLeavingState(): void {
    if (this.isLeaving) {
      this.leave()
    }
  }

  private updateIdleRunAnimation(now: number): void {
    if (
      this.idleAnimationTime &&
      this.idleAnimationMaxTime &&
      now - this.idleAnimationTime > this.idleAnimationMaxTime &&
      (this.currentFrameTag === DudesFrameTag.Walk ||
        this.currentFrameTag === DudesFrameTag.Idle)
    ) {
      if (this.currentFrameTag === DudesFrameTag.Idle) {
        this.playAnimation(DudesFrameTag.Walk)
      } else {
        this.playAnimation(DudesFrameTag.Idle)
      }

      this.updateIdleAnimationTime({ time: now })
    }
  }

  private updateGravity(): void {
    this.velocity.y =
      this.velocity.y +
      (this.settings.settings.dude.gravity * DELTA_TIME) / ROUND
  }

  private getCurrentPosition(): IPointData {
    return {
      x: this.view.position.x + (this.velocity.x * DELTA_TIME) / ROUND,
      y: this.view.position.y + (this.velocity.y * DELTA_TIME) / ROUND
    }
  }

  private handleGroundCollision(newPosition: IPointData, now: number): void {
    const groundY =
      newPosition.y +
      (Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale

    if (groundY > window.innerHeight) {
      this.velocity.y = 0
      this.velocity.x = 0

      newPosition.y =
        window.innerHeight -
        (Collider.Y + Collider.Height - SPRITE_SIZE / 2) * this.scale

      if (this.currentFrameTag === DudesFrameTag.Fall) {
        this.playAnimation(DudesFrameTag.Land)
        this.landAnimationTime = now
      }
    }
  }

  private handleFalling(): void {
    if (this.velocity.y > 0) {
      this.playAnimation(DudesFrameTag.Fall)
    }
  }

  private handleGrowth(): void {
    if (!this.isGrowing) return

    if (this.scale <= this.settings.settings.dude.growMaxScale) {
      this.updateScale(0.1)

      const width = window.innerWidth
      const leftBound = this.view.x - (Collider.Width / 2) * this.scale
      const rightBound = this.view.x + (Collider.Width / 2) * this.scale

      if (rightBound >= width) {
        this.view.x = width - (Collider.Width / 2) * this.scale
        this.updateDirection(Direction.Left)
      }

      if (leftBound <= 0) {
        this.view.x = (Collider.Width / 2) * this.scale
        this.updateDirection(Direction.Right)
      }
    }

    this.growingTime -= DELTA_TIME
  }

  private handleShrinking(): void {
    if (
      this.growingTime <= 0 &&
      this.scale > this.settings.settings.dude.scale
    ) {
      this.isGrowing = false
      this.updateScale(-0.01)
    }
  }

  private handleScreenExit(newPosition: IPointData): void {
    const width = window.innerWidth
    if (newPosition.x < 0 || newPosition.x > width) {
      this.currentLifeTime = 0
    }
  }

  private handleWallCollision(): void {
    const width = window.innerWidth
    const isCollidingRight =
      this.view.x + (Collider.Width / 2) * this.scale >= width
    const isCollidingLeft =
      this.view.x - (Collider.Width / 2) * this.scale <= 0

    if (isCollidingRight || isCollidingLeft) {
      if (!this.isLeaving) {
        this.direction = -this.direction
      }

      this.velocity.x = -this.velocity.x
      this.view.position.x += (this.direction * DELTA_TIME * 60) / ROUND

      if (Math.random() >= 0.7) {
        this.updateScale()
      }
    }
  }

  private updateMovement(): void {
    if (
      this.currentFrameTag !== DudesFrameTag.Idle ||
      (this.isGrowing && this.scale < this.settings.settings.dude.growMaxScale)
    ) {
      this.view.position.x += (this.direction * DELTA_TIME * 60) / ROUND
    }
  }

  private updateLifeCycle(): void {
    if (this.currentLifeTime > 0) {
      this.currentLifeTime -= DELTA_TIME
    } else {
      if (this.currentOpacityTime > 0) {
        this.currentOpacityTime -= DELTA_TIME
        this.view.alpha = this.currentOpacityTime / this.maxOpacityTime
      } else {
        for (const onRemove of this.onRemoveCallbacks) {
          onRemove()
        }
      }
    }
  }

  private updateChildComponents(): void {
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
    await this.spriteLoader.loadSprite(spriteData)
    this.textureProvider.unloadTextures(spriteData.name)
    this.config.sprite = spriteData
    this.playAnimation(DudesFrameTag.Idle, true)
  }

  updateLifeTime({
    lifeTime,
    opacityTime
  }: { lifeTime?: number; opacityTime?: number } = {}): void {
    this.currentLifeTime = lifeTime ?? this.settings.settings.dude.maxLifeTime
    this.currentOpacityTime = opacityTime ?? this.maxOpacityTime
    this.view.alpha = 1
  }

  onRemove(callback: () => void) {
    this.onRemoveCallbacks.push(callback)
  }
}
