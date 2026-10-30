<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { frameAt, renderFrame } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let startedAt = 0
let offscreen: HTMLCanvasElement | null = null

function draw(frame: number): void {
  const element = canvas.value
  if (!element) return
  const context = element.getContext('2d')
  if (!context) return

  if (!offscreen) {
    offscreen = document.createElement('canvas')
    offscreen.width = 32
    offscreen.height = 32
  }

  const image = new ImageData(
    new Uint8ClampedArray(renderFrame(props.editor.doc.value, frame)),
    32,
    32
  )
  offscreen.getContext('2d')!.putImageData(image, 0, 0)

  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, element.width, element.height)
  context.drawImage(offscreen, 0, 0, element.width, element.height)
}

function loop(now: number): void {
  if (!startedAt) startedAt = now
  draw(frameAt(now - startedAt))
  rafId = requestAnimationFrame(loop)
}

function start(): void {
  if (rafId) return
  startedAt = 0
  rafId = requestAnimationFrame(loop)
}

function stop(): void {
  if (!rafId) return
  cancelAnimationFrame(rafId)
  rafId = 0
}

watch(
  () => props.editor.revision.value,
  () => {
    if (startedAt) draw(frameAt(performance.now() - startedAt))
  }
)

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <div class="panel-block">
    <h2>Preview</h2>
    <div class="preview-frame">
      <canvas ref="canvas" :width="128" :height="128" />
    </div>
    <p class="hint">idle · jump · fall · land · run</p>
  </div>
</template>

<style scoped>
.preview-frame {
  display: grid;
  place-items: center;
  padding: 8px;
  border-radius: 8px;
  background: repeating-conic-gradient(
      #24242c 0% 25%,
      #16161c 0% 50%
    )
    50% / 16px 16px;
}

canvas {
  width: 100%;
  max-width: 128px;
  aspect-ratio: 1;
  image-rendering: pixelated;
}

.hint {
  margin: 8px 0 0;
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.05em;
  color: var(--muted);
  text-transform: uppercase;
}
</style>
