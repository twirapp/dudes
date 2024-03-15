<script setup lang="ts">
import { Dudes, DudesFrameTags, DudesLayers } from '@twirapp/dudes-demo'
import { ref, shallowRef, onMounted } from 'vue'
import { assetsLoaderOptions, dudesLayers } from '../overlay/constants.js'
import { createDudeSprite } from '../overlay/utils.js'

import type { Dude, DudeSpriteFrameTag } from '@twirapp/dudes-demo/types'
import type { SpriteColors, SpriteLayers } from '../overlay/types.js'

const props = withDefaults(defineProps<{
  sprite: SpriteLayers
  colors: SpriteColors
}>(), {
  sprite: () => ({
    body: dudesLayers.body[0].src,
    eyes: dudesLayers.eyes[0].src,
    mouth: '',
    hat: '',
    cosmetics: ''
  }),
  colors: () => ({
    bodyColor: '#E6AC0C',
    eyesColor: '#FFF',
    mouthColor: '#FFF',
    hatColor: '#FFF',
    cosmeticsColor: '#FFF'
  })
})

const dudesDemoRef = shallowRef<Dudes | null>(null)
const dudeRef = shallowRef<Dude | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const isFrame = ref(false)

onMounted(async () => {
  if (!canvasRef.value) return

  isFrame.value = window.top === window

  dudesDemoRef.value = new Dudes({
    assetsLoaderOptions,
    settings: {
      dude: {
        scale: 4,
        maxLifeTime: Number.MAX_SAFE_INTEGER
      }
    }
  })

  await dudesDemoRef.value.init(canvasRef.value)

  const name = 'Twir'
  const dude = await dudesDemoRef.value.createDude({
    id: name,
    name: name,
    sprite: createDudeSprite(props.sprite)
  })

  dude.updateColor(DudesLayers.body, props.colors.bodyColor)
  dude.updateColor(DudesLayers.eyes, props.colors.eyesColor)
  dude.updateColor(DudesLayers.mouth, props.colors.mouthColor)
  dude.updateColor(DudesLayers.hat, props.colors.hatColor)
  dude.updateColor(DudesLayers.cosmetics, props.colors.cosmeticsColor)

  dudeRef.value = dude
})

function playAnimation(frameTag: DudeSpriteFrameTag) {
  if (!dudeRef.value) return
  dudeRef.value.playAnimation(DudesFrameTags[frameTag], true)
}

function focusIn() {
  playAnimation(DudesFrameTags.run)
}

function focusOut() {
  playAnimation(DudesFrameTags.idle)
}
</script>

<template>
  <div v-if="!isFrame" style="position: absolute; display: flex; gap: 4px;">
    <button @click="playAnimation(DudesFrameTags.idle)">Idle</button>
    <button @click="playAnimation(DudesFrameTags.run)">Run</button>
    <button @click="playAnimation(DudesFrameTags.jump)">Jump</button>
    <button @click="playAnimation(DudesFrameTags.fall)">Fall</button>
    <button @click="playAnimation(DudesFrameTags.land)">Lang</button>
  </div>
  <canvas v-bind="$attrs" ref="canvasRef" @mouseenter="focusIn" @mouseleave="focusOut"></canvas>
</template>
