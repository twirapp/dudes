import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DudesMethods, DudesTypes } from '@twirapp/dudes/types'

import { randomRgbColor } from '@/utils.js'
import { dudesLayers } from './constants.js'
import type { SpriteColors, SpriteLayers } from './types.js'

export const useDudesSettings = defineStore('use-dudes', () => {
  const spriteLayers = ref<SpriteLayers>({
    body: dudesLayers.body[0].src,
    eyes: dudesLayers.eyes[0].src,
    mouth: '',
    hat: '',
    cosmetics: ''
  })

  const spriteColors = ref<SpriteColors>({
    bodyColor: '#E6AC0C',
    eyesColor: '#FFF',
    mouthColor: '#FFF',
    hatColor: '#FFF',
    cosmeticsColor: '#FFF'
  })

  const dudesSettings = ref<{
    dude: DudesTypes.DudeStyles
    sounds: DudesTypes.DudeSounds
    message: DudesTypes.MessageBoxStyles
    name: DudesTypes.NameBoxStyles
    emotes: DudesTypes.EmotesStyles
  }>({
    dude: {
      bodyColor: randomRgbColor(),
      maxLifeTime: 1000 * 60 * 30,
      growTime: 1000 * 2,
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
      boxColor: '#E6AC0C',
      fontFamily: 'Roboto',
      fontSize: 14,
      padding: 5,
      showTime: 5 * 1000,
      fill: '#333333'
    },
    name: {
      enabled: true,
      fontFamily: 'Roboto',
      fontSize: 18,
      fill: '#FFFFFF',
      lineJoin: 'round',
      strokeThickness: 4,
      stroke: '#333333',
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
      dropShadowColor: '#3AC7D9'
    },
    emotes: {
      enabled: true
    }
  })

  const dudesRef = ref<DudesMethods>()

  return {
    spriteLayers,
    spriteColors,
    dudesSettings,
    dudesRef
  }
})
