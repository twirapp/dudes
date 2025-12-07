<script setup lang="ts">
import DudesOverlay, { DudesFrameTag, DudesLayer } from '@twirapp/dudes-vue'
import { onMounted } from 'vue'
import { createDudeSprite } from './utils.js'
import { assetsLoaderOptions, dudesSounds } from './constants.js'
import { useDudesSettings } from './use-dudes-settings.js';
import { storeToRefs } from 'pinia'

import type { Dude } from '@twirapp/dudes-vue/types';
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
  if (!dudesRef.value || !dudesRef.value.dudes || event.source === window) return

  const { type, data } = JSON.parse(event.data) as OverlayMessageEvent

  if (type === 'spawn') {
    await dudesRef.value.dudes.createDude({
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
    traverseDudes((dude) => dude.updateScale(data.dude.scale, true))
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

  if (type === DudesFrameTag.Walk) {
    traverseDudes((dude) => {
      dude.updateIdleAnimationTime({ time: performance.now() })
      dude.playAnimation(DudesFrameTag.Walk)
    })
  }

  if (type === 'idle') {
    traverseDudes((dude) => {
      dude.updateIdleAnimationTime({
        time: Number.MAX_SAFE_INTEGER,
        maxTime: Number.MAX_SAFE_INTEGER
      })
      dude.playAnimation(DudesFrameTag.Idle)
    })
  }

  if (type === 'clear') {
    dudesRef.value.dudes.removeAllDudes()
  }
}

function traverseDudes(callback: (dude: Dude) => void): void {
  if (!dudesRef.value || !dudesRef.value.dudes) return
  for (const dude of dudesRef.value.dudes.dudes.values()) {
    callback(dude)
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
    dude.updateColor(DudesLayer.Body, spriteColors.value.bodyColor)
    dude.updateColor(DudesLayer.Eyes, spriteColors.value.eyesColor)
    dude.updateColor(DudesLayer.Mouth, spriteColors.value.mouthColor)
    dude.updateColor(DudesLayer.Hat, spriteColors.value.hatColor)
    dude.updateColor(DudesLayer.Cosmetics, spriteColors.value.cosmeticsColor)
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
