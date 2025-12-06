<template>
  <Teleport to="body">
    <v-tweakpane
      style="overflow-y: scroll;"
      :pane="{ title: 'Dudes Configurator' }"
      @on-pane-created="onPaneCreated"
    />
  </Teleport>

  <div class="container">
    <dude-preview
      :size="512"
      :sprite="sprite"
      :animation="options.animation"
    />
  </div>
</template>

<script setup lang="ts">
import { VTweakpane } from 'v-tweakpane';
import type { Pane } from 'tweakpane';
import { DudesFrameTags } from './constants';
import DudePreview, { Sprite } from './dude-preview.vue';
import { computed, ref } from 'vue';
import { capitalize, entries } from '@zero-dependency/utils'
import { dudesLayers } from '../overlay/constants';
import { useDudesSettings } from '../overlay/use-dudes-settings';
import { storeToRefs } from 'pinia';

const options = ref<{
  animation: DudesFrameTags,
}>({
  animation: DudesFrameTags.Walk,
})

const { spriteColors, spriteLayers } = storeToRefs(useDudesSettings())
const sprite = computed<Sprite>(() => {
  const spriteData: Sprite = {
    body: {
      src: spriteLayers.value.body,
      color: spriteColors.value.bodyColor,
    }
  }

  for (const [layer] of entries(spriteLayers.value)) {
    const src = spriteLayers.value[layer]
    if (!src) continue
    spriteData[layer] = {
      src,
      color: spriteColors.value[`${layer}Color`],
    }
  }

  return spriteData
})

function onPaneCreated(pane: Pane) {
  const hiddenOption = { text: 'Hidden', value: '' }
  const frameTagOptions = Object.values(DudesFrameTags)
    .map((frame) => ({ text: capitalize(frame), value: frame }))
  const bodySpriteOptions = dudesLayers.body
    .map((layer) => ({ text: layer.name, value: layer.src }))

  bodySpriteOptions.unshift(hiddenOption)
  pane.addBinding(spriteLayers.value, 'body', {
    label: 'Body',
    options: bodySpriteOptions.slice(1)
  })

  pane.addBinding(spriteColors.value, 'bodyColor', {
    label: ''
  })

  pane.addBlade({ view: 'separator' })

  const eyesSpriteOptions = dudesLayers.eyes
    .map((layer) => ({ text: layer.name, value: layer.src }))
  eyesSpriteOptions.unshift(hiddenOption)
  pane.addBinding(spriteLayers.value, 'eyes', {
    label: 'Eyes',
    options: eyesSpriteOptions
  })

  pane.addBinding(spriteColors.value, 'eyesColor', {
    label: ''
  })

  pane.addBlade({ view: 'separator' })

  const mouthSpriteOptions = dudesLayers.mouth
    .map((layer) => ({ text: layer.name, value: layer.src }))
  mouthSpriteOptions.unshift(hiddenOption)
  pane.addBinding(spriteLayers.value, 'mouth', {
    label: 'Mouth',
    options: mouthSpriteOptions
  })

  pane.addBinding(spriteColors.value, 'mouthColor', {
    label: ''
  })

  pane.addBlade({ view: 'separator' })

  const hatSpriteOptions = dudesLayers.hat
    .map((layer) => ({ text: layer.name, value: layer.src }))
  hatSpriteOptions.unshift(hiddenOption)
  pane.addBinding(spriteLayers.value, 'hat', {
    label: 'Hat',
    options: hatSpriteOptions
  })

  pane.addBinding(spriteColors.value, 'hatColor', {
    label: ''
  })

  pane.addBlade({ view: 'separator' })

  const cosmeticsSpriteOptions = dudesLayers.cosmetics
    .map((layer) => ({ text: layer.name, value: layer.src }))
  cosmeticsSpriteOptions.unshift(hiddenOption)
  pane.addBinding(spriteLayers.value, 'cosmetics', {
    label: 'Cosmetic',
    options: cosmeticsSpriteOptions
  })

  pane.addBinding(spriteColors.value, 'cosmeticsColor', {
    label: ''
  })

  pane.addBlade({ view: 'separator' })

  pane.addBinding(options.value, 'animation', {
    label: 'Animation',
    options: frameTagOptions
  })
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}
</style>
