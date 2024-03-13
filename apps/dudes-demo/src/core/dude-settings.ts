import { deepMerge } from '../helpers.js'
import type { DudePartialSettings, DudesTypes } from '../types.js'

export type DudeInternalSettings = {
  dude: DudesTypes.DudeStyles
}

export class DudeSettings {
  private dudesStyles: DudeInternalSettings = {
    dude: {
      maxLifeTime: 1000 * 60 * 30,
      scale: 4
    }
  }

  get settings() {
    return this.dudesStyles
  }

  update(styles: DudePartialSettings): void {
    this.dudesStyles = deepMerge(this.dudesStyles, styles)
  }
}
