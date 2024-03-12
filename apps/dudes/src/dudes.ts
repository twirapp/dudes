import { Container, Renderer } from 'pixi.js'

import { AssetsLoader } from './core/assets-loader.js'
import { DudeSettings } from './core/dude-settings.js'
import { Dude } from './core/dude.js'
import { RequestAnimationFrame } from './core/raf.js'
import { SoundsLoader } from './core/sounds-loader.js'
import { SpriteProvider } from './core/sprite-provider.js'
import type {
  AssetsLoaderOptions,
  DudePartialSettings,
  DudesTypes,
  SoundAsset
} from './types.js'

interface DudesParams {
  soundAssets: SoundAsset[]
  assetsLoaderOptions?: AssetsLoaderOptions
  settings?: DudePartialSettings
}

export class Dudes {
  private settings: DudeSettings
  private raf: RequestAnimationFrame
  private spriteProvider: SpriteProvider
  private assetsLoader: AssetsLoader
  private soundsLoader: SoundsLoader
  private renderer: Renderer | null = null

  private dudesMap = new Map<string, Dude>()
  private dudesContainer = new Container()

  constructor(params: DudesParams) {
    this.settings = new DudeSettings()
    if (params.settings) {
      this.settings.update(params.settings)
    }

    this.assetsLoader = new AssetsLoader(params.assetsLoaderOptions)
    this.spriteProvider = new SpriteProvider(this.assetsLoader)
    // TODO: refactor!
    this.assetsLoader.onUnload((spriteName) => {
      this.spriteProvider.unloadTextures(spriteName)
    })
    this.soundsLoader = new SoundsLoader(params.soundAssets)

    this.onResize = this.onResize.bind(this)
    this.update = this.update.bind(this)
    this.raf = new RequestAnimationFrame(this.update)
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    await this.assetsLoader.init()
    await this.soundsLoader.init()

    this.renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      view: canvas,
      antialias: true
    })

    window.addEventListener('resize', this.onResize)
    this.raf.start()
  }

  dispose(): void {
    if (!this.renderer) return
    this.renderer.destroy()
    this.renderer = null
    window.removeEventListener('resize', this.onResize)
  }

  private onResize(): void {
    this.renderer?.resize(window.innerWidth, window.innerHeight)
  }

  private update(): void {
    this.updateDudes()
    this.renderer?.render(this.dudesContainer)
  }

  private updateDudes(): void {
    for (const dude of this.dudesMap.values()) {
      dude.update()
    }
  }

  get dudes(): Map<string, Dude> {
    return this.dudesMap
  }

  updateSettings(settings: DudePartialSettings): void {
    this.settings.update(settings)
  }

  getDude(dudeId: string): Dude | undefined {
    return this.dudesMap.get(dudeId) as Dude
  }

  async createDude(config: DudesTypes.DudeConfig): Promise<Dude> {
    this.removeDude(config.id)

    const dude = new Dude(
      config,
      this.spriteProvider,
      this.assetsLoader,
      this.soundsLoader,
      this.settings.settings
    )
    dude.onRemove(() => this.removeDude(config.id))
    await dude.init()

    this.dudesMap.set(config.id, dude)
    this.dudesContainer.addChild(dude.view)

    return dude
  }

  removeDude(dudeId: string): void {
    const dude = this.dudesMap.get(dudeId)
    if (!dude) return

    this.dudesMap.delete(dude.config.id)
    this.dudesContainer.removeChild(dude.view)

    const isSpriteUsed = Array.from(this.dudesMap.values()).some(
      (v) => v.config.sprite.name === dude.config.sprite.name
    )

    if (!isSpriteUsed) {
      this.assetsLoader.unload(dude.config.name)
    }
  }

  removeAllDudes(): void {
    for (const dudeId of this.dudesMap.keys()) {
      this.removeDude(dudeId)
    }
  }
}
