<template>
  <div class="dude-preview">
    <div
      v-for="[name, frame] in entries(sprite)"
      :key="name"
      class="frame"
      :style="{
        '--frame-url': `url(${frameUrl(frame?.src)})`,
        '--frame-x': frameOffsetX,
        '--frame-y': frameOffsetY,
        '--frame-color': frame?.color ?? '#fff'
      }"
    >
      <div class="mask" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { entries } from '@zero-dependency/utils'
import { assetsLoaderOptions, dudesLayers } from '../overlay/constants.js'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { frameAnimations } from './constants.js'
import { DudesFrameTag } from '@twirapp/dudes-vue'

interface SpriteData {
  src: string
  color?: string
}

export interface Sprite {
  body: SpriteData,
  eyes?: SpriteData,
  mouth?: SpriteData,
  hat?: SpriteData,
  cosmetics?: SpriteData
}

interface DudePreviewProps {
  size: number
  sprite?: Sprite
  animation?: DudesFrameTag
  fps?: number
}

const props = withDefaults(defineProps<DudePreviewProps>(), {
  sprite: () => ({
    body: {
      src: dudesLayers.body[0].src,
      color: '#e6ac0c'
    },
    eyes: {
      src: dudesLayers.eyes[0].src,
      color: '#fff'
    },
    mouth: {
      src: dudesLayers.mouth[1].src,
      color: '#fff'
    },
    hat: {
      src: dudesLayers.hat[0].src,
      color: '#fff'
    },
    cosmetics: {
      src: dudesLayers.cosmetics[2].src,
      color: '#fff'
    }
  }),
  fps: 4,
  animation: DudesFrameTag.Idle,
})

const currentFrameIndex = ref(0)

let animationFrameId: number | null = null
let lastFrameTime = 0

function frameUrl(url?: string) {
  if (!url) return
  return assetsLoaderOptions.basePath + url
}

const previewSize = computed(() => {
  return `${props.size}px`
})

const frameWidth = 32
const frameBottomOffset = 7

const frameOffsetY = computed(() => {
  return `${(props.size * frameBottomOffset / frameWidth)}px`
})

const frameOffsetX = computed(() => {
  const scale = props.size / frameWidth
  return `${-currentFrameIndex.value * frameWidth * scale}px`
})

const currentAnimation = computed(() => {
  return frameAnimations
    .find(anim => anim.name === props.animation) ?? frameAnimations[0]
})

function animate(timestamp: number) {
  const fpsInterval = 1000 / props.fps
  const elapsed = timestamp - lastFrameTime

  if (elapsed > fpsInterval) {
    lastFrameTime = timestamp - (elapsed % fpsInterval)

    const anim = currentAnimation.value
    const frameCount = anim.to - anim.from + 1

    if (frameCount > 1) {
      const localIndex = (currentFrameIndex.value - anim.from + 1) % frameCount
      currentFrameIndex.value = anim.from + localIndex
    } else {
      currentFrameIndex.value = anim.from
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  currentFrameIndex.value = currentAnimation.value.from
  lastFrameTime = performance.now()
  animationFrameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped lang="scss">
.dude-preview {
  width: v-bind(previewSize);
  height: v-bind(previewSize);
  outline: 2px solid #e3e3e3;
  border-radius: 8px;
  position: relative;
  background-color: #444;

  .frame {
    position: absolute;
    left: 0;
    width: inherit;
    height: inherit;
    background-image: var(--frame-url);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: var(--frame-x) var(--frame-y);
    image-rendering: pixelated;

    .mask {
      width: inherit;
      height: inherit;
      mask-mode: alpha;
      mask-size: cover;
      mask-image: var(--frame-url);
      mask-position: var(--frame-x) var(--frame-y);
      mix-blend-mode: multiply;
      background-color: var(--frame-color);
      background-size: cover;
    }
  }
}
</style>
