import { DudesLayers } from '@twirapp/dudes'
import type { DudesLayer, DudesTypes } from '@twirapp/dudes/types'

import type { SpriteLayers } from './types.js'

export function createDudeSprite(spriteLayers: SpriteLayers, name = 'dude') {
  const layers = {
    [DudesLayers.body]: spriteLayers.body,
    [DudesLayers.eyes]: spriteLayers.eyes,
    [DudesLayers.mouth]: spriteLayers.mouth,
    [DudesLayers.hat]: spriteLayers.hat,
    [DudesLayers.cosmetics]: spriteLayers.cosmetics
  }

  const sprite: DudesTypes.SpriteData = {
    name,
    layers: Object.entries(layers)
      .map(([layer, src]) => ({ layer: layer as DudesLayer, src }))
      .filter((layer) => layer.src)
  }

  return sprite
}
