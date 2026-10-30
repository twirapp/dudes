<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { renderFrame } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor; frame: number }>()

const canvas = ref<HTMLCanvasElement | null>(null)

function draw(): void {
  const element = canvas.value
  if (!element) return
  const context = element.getContext('2d')
  if (!context) return

  const image = new ImageData(
    new Uint8ClampedArray(
      renderFrame(props.editor.doc.value, props.frame)
    ),
    32,
    32
  )
  const offscreen = document.createElement('canvas')
  offscreen.width = 32
  offscreen.height = 32
  offscreen.getContext('2d')!.putImageData(image, 0, 0)

  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, element.width, element.height)
  context.drawImage(offscreen, 0, 0, element.width, element.height)
}

watch(
  [() => props.editor.revision.value, () => props.editor.onionSkin.value],
  draw
)

onMounted(draw)
</script>

<template>
  <canvas ref="canvas" :width="64" :height="64" class="frame-thumb" />
</template>

<style scoped>
.frame-thumb {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
</style>
