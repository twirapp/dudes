<script setup lang="ts">
import DudesOverlay, { DudesFrameTags, DudesLayers } from '@twirapp/dudes'
import { onMounted } from 'vue'
import { createDudeSprite } from './utils.js'
import { assetsLoaderOptions, dudesSounds } from './constants.js'
import { useDudesSettings } from './use-dudes-settings.js';
import { storeToRefs } from 'pinia'

import type { Dude } from '@twirapp/dudes/types';
import type { OverlayMessageEvent } from './types.js'

const {
  dudesRef,
  spriteLayers,
  spriteColors,
  dudesSettings
} = storeToRefs(useDudesSettings())

onMounted(async () => {
  if (!dudesRef.value) return
  await dudesRef.value.initDudes()

  window.addEventListener('message', onMessage)
  window.parent.postMessage('on-mounted-dudes')
})

async function onMessage(event: MessageEvent<string>) {
  if (!dudesRef.value) return

  const { type, data } = JSON.parse(event.data) as OverlayMessageEvent

  if (type === 'spawn') {
    await dudesRef.value.createDude({
      id: data.id,
      name: data.name,
      sprite: createDudeSprite(spriteLayers.value)
    })

    updateDudesColors()
  }

  if (type === 'update-sprite') {
    spriteLayers.value = data
    await updateDudesSprite()
  }

  if (type === 'update-colors') {
    spriteColors.value = data
    updateDudesColors()
  }

  if (type === 'update-settings') {
    dudesSettings.value = data
  }

  if (type === 'jump') {
    traverseDudes((dude) => dude.jump())
  }

  if (type === 'grow') {
    traverseDudes((dude) => dude.grow())
  }

  if (type === 'leave') {
    traverseDudes((dude) => dude.leave())
  }

  if (type === 'spit-emote') {
    traverseDudes((dude) => dude.addEmotes([`emotes/${data}`]))
  }

  if (type === 'show-message') {
    traverseDudes((dude) => {
      const message = data.replace('{name}', dude.config.name)
      dude.addMessage(message)
    })
  }

  if (type === 'run') {
    traverseDudes((dude) => {
      dude.updateIdleAnimationTime({ time: performance.now() })
      dude.playAnimation(DudesFrameTags.run)
    })
  }

  if (type === 'idle') {
    traverseDudes((dude) => {
      dude.updateIdleAnimationTime({
        time: Number.MAX_SAFE_INTEGER,
        maxTime: Number.MAX_SAFE_INTEGER
      })
      dude.playAnimation(DudesFrameTags.idle)
    })
  }

  if (type === 'clear') {
    dudesRef.value.removeAllDudes()
  }
}

function traverseDudes(callback: (dude: Dude) => void): void {
  if (!dudesRef.value) return
  for (const dude of dudesRef.value.dudes.values()) {
    callback(dude as Dude)
  }
}

async function updateDudesSprite(): Promise<void> {
  traverseDudes(async (dude) => {
    const spriteData = createDudeSprite(spriteLayers.value)
    await dude.updateSpriteData(spriteData)
  })
}

function updateDudesColors(): void {
  traverseDudes((dude) => {
    dude.updateColor(DudesLayers.body, spriteColors.value.bodyColor)
    dude.updateColor(DudesLayers.eyes, spriteColors.value.eyesColor)
    dude.updateColor(DudesLayers.mouth, spriteColors.value.mouthColor)
    dude.updateColor(DudesLayers.hat, spriteColors.value.hatColor)
    dude.updateColor(DudesLayers.cosmetics, spriteColors.value.cosmeticsColor)
  })
}
</script>

<template>
  <dudes-overlay
    ref="dudesRef"
    :settings="dudesSettings"
    :assets-loader-options="assetsLoaderOptions"
    :sounds="dudesSounds"
  />
</template>
