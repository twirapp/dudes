import { DudesLayer } from '@twirapp/dudes-vue'
import { entries } from '@zero-dependency/utils'

import type { DudesTypes } from '@twirapp/dudes-vue/types'
import type { SpriteLayers } from './types.js'

export function createDudeSprite(spriteLayers: SpriteLayers, name = 'dude') {
  const layers = {
    [DudesLayer.Body]: spriteLayers.body,
    [DudesLayer.Eyes]: spriteLayers.eyes,
    [DudesLayer.Mouth]: spriteLayers.mouth,
    [DudesLayer.Hat]: spriteLayers.hat,
    [DudesLayer.Cosmetics]: spriteLayers.cosmetics,
  }

  const sprite: DudesTypes.SpriteData = {
    name,
    layers: entries(layers)
      .map(([layer, src]) => ({ layer, src }))
      .filter((layer) => layer.src),
  }

  return sprite
}
