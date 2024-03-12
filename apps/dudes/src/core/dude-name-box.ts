import { Text } from 'pixi.js'

import { dudesSettings } from '../composables/use-settings.js'
import { SPRITE_SIZE } from '../constants.js'
import type { DudesTypes } from '../types.js'

export class DudeNameBox {
  readonly view: Text

  constructor(
    name: string,
    private readonly styles?: DudesTypes.IndividualNameBoxStyles
  ) {
    this.view = new Text(name)
    this.view.anchor.set(0.5, 1)
    this.view.zIndex = 100
  }

  update(scale: number): void {
    this.view.visible = dudesSettings.value.name.enabled
    this.view.position.y = -((SPRITE_SIZE * scale) / 2)

    const styles = this.styles
      ? { ...dudesSettings.value.name, ...this.styles }
      : dudesSettings.value.name

    this.updateParams(styles)
  }

  private updateParams(styles: Record<string, any>): void {
    this.view.style = {
      ...styles,
      align: 'center'
    }
  }
}
