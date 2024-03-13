import { Text } from 'pixi.js'

import { SPRITE_SIZE } from '../constants.js'
import type { DudesTypes } from '../types.js'
import type { DudeSettings } from './dude-settings.js'

export class DudeNameBox {
  readonly view: Text

  constructor(
    name: string,
    private readonly settings: DudeSettings,
    private readonly styles?: DudesTypes.IndividualNameBoxStyles
  ) {
    this.view = new Text(name)
    this.view.anchor.set(0.5, 1)
    this.view.zIndex = 100
  }

  update(scale: number): void {
    this.view.visible = this.settings.settings.name.enabled
    this.view.position.y = -((SPRITE_SIZE * scale) / 2)

    const styles = this.styles
      ? { ...this.settings.settings.name, ...this.styles }
      : this.settings.settings.name

    this.updateParams(styles)
  }

  private updateParams(styles: Record<string, any>): void {
    this.view.style = {
      ...styles,
      align: 'center'
    }
  }
}
