import { DudesLayer } from '@twirapp/dudes/types'
import type { DudesTypes } from '@twirapp/dudes/types'

export type SpriteLayers = Record<DudesLayer, string>

type LayerColor<T extends string> = `${T}Color`
export type SpriteColors = {
  [Layer in DudesLayer as LayerColor<Layer>]: string
}

export type DudesSettings = {
  dude: DudesTypes.DudeStyles
  sounds: DudesTypes.DudeSounds
  message: DudesTypes.MessageBoxStyles
  name: DudesTypes.NameBoxStyles
  emotes: DudesTypes.EmotesStyles
}

interface OverlayMessageDudeData {
  id: string
  name: string
}

export type OverlayMessageEvent =
  | { type: 'spawn'; data: OverlayMessageDudeData }
  | { type: 'jump'; data: null }
  | { type: 'grow'; data: null }
  | { type: 'leave'; data: null }
  | { type: 'run'; data: null }
  | { type: 'idle'; data: null }
  | { type: 'clear'; data: null }
  | { type: 'spit-emote'; data: string }
  | { type: 'show-message'; data: string }
  | { type: 'update-sprite'; data: SpriteLayers }
  | { type: 'update-colors'; data: SpriteColors }
  | { type: 'update-settings'; data: DudesSettings }
