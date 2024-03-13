# Dudes

> Animated dudes for chatters in your stream

## Install

```bash
pnpm add @twirapp/dudes-vue
```

## Usage

```vue
<script setup lang="ts">
import DudesOverlay, { DudesLayers } from '@twirapp/dudes-vue'
import { onMounted, ref } from 'vue'

import type {
  DudePartialSettings,
  AssetsLoaderOptions,
  SoundAsset
} from '@twirapp/dudes-vue/types'

const soundAssets: SoundAsset[] = [
  {
    alias: 'Jump',
    src: './sounds/jump.mp3'
  }
]

const assetsLoaderOptions: AssetsLoaderOptions = {
  basePath: location.href + 'sprites/',
  defaultSearchParams: {
    ts: Date.now()
  }
}

const settings = ref<DudePartialSettings>({
  // override default settings
})

const dudesRef = ref<InstanceType<typeof DudesOverlay> | null>(null)

onMounted(async () => {
  if (!dudesRef.value?.dudes) return
  await dudesRef.value.initDudes()

  const dudeName = 'Twir'
  const dude = await dudesRef.value.dudes.createDude({
    id: dudeName,
    name: dudeName,
    sprite: {
      name: 'dude',
      layers: [
        {
          layer: DudesLayers.body,
          // http://localhost:5173/sprites/body.png
          src: 'body.png'
        },
        {
          layer: DudesLayers.eyes,
          // http://localhost:5173/sprites/eyes.png
          src: 'eyes.png'
        }
      ]
    }
  })
})
</script>

<template>
  <dudes-overlay
    ref="dudesRef"
    :assets-loader-options="assetsLoaderOptions"
    :sounds="soundAssets"
    :settings="settings"
  />
</template>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
  background: #000;
}
</style>
```

## Creating new sprites

It's really easy to create sprites with [Aseprite](https://github.com/aseprite/aseprite)

Sprite size is 32x32.

Example can be found in [sprites](apps/playground/public/sprites) folder.

## Useful links

- [https://0x72.itch.io/pixeldudesmaker](https://0x72.itch.io/pixeldudesmaker)
- [https://masterpose.itch.io/pixelduuuuudesmaker](https://masterpose.itch.io/pixelduuuuudesmaker)
