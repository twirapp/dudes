import { deepMerge } from '../helpers.js'
import type { DudePartialSettings, DudesTypes } from '../types.js'

export type DudeInternalSettings = {
  dude: DudesTypes.DudeStyles
  sounds: DudesTypes.DudeSounds
  message: DudesTypes.MessageBoxStyles
  name: DudesTypes.NameBoxStyles
  emotes: DudesTypes.EmotesStyles
}

export class DudeSettings {
  private dudesStyles: DudeInternalSettings = {
    dude: {
      bodyColor: '#969696',
      maxLifeTime: 1000 * 60 * 30,
      growTime: 1000 * 60 * 5,
      growMaxScale: 20,
      gravity: 400,
      scale: 4
    },
    sounds: {
      enabled: true,
      volume: 0.01
    },
    message: {
      enabled: true,
      borderRadius: 5,
      boxColor: '#EEEEEE',
      fontFamily: 'Arial',
      fontSize: 20,
      padding: 10,
      showTime: 5 * 1000,
      fill: '#333333'
    },
    name: {
      enabled: true,
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#FFFFFF',
      lineJoin: 'round',
      strokeThickness: 4,
      stroke: '#000000',
      fillGradientStops: [0],
      fillGradientType: 0,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 400,
      dropShadow: false,
      dropShadowAlpha: 1,
      dropShadowAngle: 0,
      dropShadowBlur: 0.1,
      dropShadowDistance: 10,
      dropShadowColor: '#3EC7D9'
    },
    emotes: {
      enabled: true
    }
  }

  get settings() {
    return this.dudesStyles
  }

  update(styles: DudePartialSettings): void {
    this.dudesStyles = deepMerge(this.dudesStyles, styles)
  }
}
