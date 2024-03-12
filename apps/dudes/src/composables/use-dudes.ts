import { Container } from 'pixi.js'
import { watch } from 'vue'

import { assetsLoader } from '../core/assets-loader.js'
import { Dude } from '../core/dude.js'
import { dudesSettings } from './use-settings.js'
import type { DudesTypes } from '../types.js'

const dudes = new Map<string, Dude>()
const dudesContainer = new Container()

export function deleteDude(dude: Dude) {
  dudes.delete(dude.config.id)
  dudesContainer.removeChild(dude.view)

  const isSpriteUsed = Array.from(dudes.values()).some(
    (v) => v.config.sprite.name === dude.config.sprite.name
  )

  if (!isSpriteUsed) {
    assetsLoader.unload(dude.config.name)
  }
}

export function useDudes() {
  function updateDudes(): void {
    for (const dude of dudes.values()) {
      dude.update()
    }
  }

  function getDude(id: string): Dude | undefined {
    return dudes.get(id) as Dude
  }

  async function createDude(config: DudesTypes.DudeConfig): Promise<Dude> {
    removeDude(config.id)
    const dude = new Dude(config)
    await dude.init()
    dudes.set(config.id, dude)
    dudesContainer.addChild(dude.view)
    return dude
  }

  function removeDude(id: string): void {
    const dude = dudes.get(id)
    if (!dude) return
    deleteDude(dude)
  }

  function removeAllDudes(): void {
    for (const id of dudes.keys()) {
      removeDude(id)
    }
  }

  watch(
    () => dudesSettings.value.dude.scale,
    (scale) => {
      for (const dude of dudes.values()) {
        dude.updateScale(scale, true)
      }
    }
  )

  return {
    dudes,
    dudesContainer,
    getDude,
    createDude,
    removeDude,
    updateDudes,
    removeAllDudes
  }
}
