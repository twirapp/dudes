<script setup lang="ts">
import { entries } from '@zero-dependency/utils'
import { assetsLoaderOptions, dudesLayers } from '../overlay/constants.js'

interface SpriteData {
    src: string
    color?: string
  }

interface Sprite {
  body?: SpriteData,
  eyes?: SpriteData,
  mouth?: SpriteData,
  hat?: SpriteData,
  cosmetics?: SpriteData
}

interface DudePreviewProps {
  sprite?: Sprite
}

const props = withDefaults(defineProps<DudePreviewProps>(), {
  sprite: () => ({
    body: {
      src: dudesLayers.body[0].src,
      color: '#2e62ff'
    },
    eyes: {
      src: dudesLayers.eyes[0].src,
      color: 'tomato'
    },
    mouth: {
      src: dudesLayers.mouth[1].src,
      color: '#fff'
    },
    hat: {
      src: dudesLayers.hat[0].src,
      color: 'darkblue'
    },
    cosmetics: {
      src: dudesLayers.cosmetics[2].src,
      color: 'darkblue'
    }
  })
})

function frameUrl(url?: string) {
  if (!url) return
  return assetsLoaderOptions.basePath + url
}
</script>

<template>
  <div class="dude-preview">
    <div
      v-for="[name, frame] in entries(sprite)"
      :key="name"
      class="frame"
      :style="{
        '--frame-url': `url(${frameUrl(frame?.src)})`,
        '--frame-x': '0px',
        '--frame-y': '0px',
        '--frame-color': frame?.color
      }"
    >
      <div class="mask" />
    </div>
  </div>
</template>

<style scoped>
.dude-preview {
  width: 128px;
  height: 128px;
  border: 2px solid #000;
  border-radius: 8px;
  position: relative;
  background-color: #333;
}

/* by G00D4Y */
.frame {
  position: absolute;
  left: 0;
  width: 128px;
  height: 128px;
  background-image: var(--frame-url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: var(--frame-x) var(--frame-y);
  image-rendering: pixelated;
}

.mask {
  mask-mode: alpha;
  width: 100%;
  height: 100%;
  background-color: var(--frame-color);
  mix-blend-mode: multiply;
  mask-image: var(--frame-url);
  background-size: cover;
  mask-size: cover;
}
</style>
