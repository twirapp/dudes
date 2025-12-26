<template>
  <editor-card title="Предпросмотр анимации">
    <canvas
      ref="previewCanvasRef"
      class="preview-canvas"
      :width="SPRITE_SIZE"
      :height="SPRITE_SIZE"
      :style="{
        width: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        height: `${CANVAS_SCALE * SPRITE_SIZE}px`,
      }"
    />

    <div class="preview-controls">
      <button @click="togglePreview">
        {{ isPlaying ? 'Пауза' : 'Играть' }}
      </button>
      <label>FPS: {{ fps }}</label>
      <input
        v-model.number="fps"
        type="range"
        min="1"
        max="12"
      >
    </div>
  </editor-card>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import EditorCard from './editor-card.vue'
import { CANVAS_SCALE, SPRITE_SIZE } from './editor-constants'
import { useEditor } from './use-editor'
import { useEditorCanvas } from './use-editor-canvas'

const {
  fps,
  frames,
  isPlaying,
  currentRange,
} = useEditor()

const {
  previewCanvasRef,
  previewContext,
} = useEditorCanvas()

let previewAnimationId: number | null = null
let lastFrameTime = 0
let previewFrameIndex = 0

function animatePreview(timestamp: number) {
  const fpsInterval = 1000 / fps.value
  const elapsed = timestamp - lastFrameTime

  if (elapsed > fpsInterval) {
    lastFrameTime = timestamp - (elapsed % fpsInterval)

    const range = currentRange.value
    const frameCount = range.to - range.from + 1

    const ctx = previewContext.value
    if (ctx) {
      ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
      ctx.imageSmoothingEnabled = false

      const frameIndex = range.from + (previewFrameIndex % frameCount)
      ctx.putImageData(frames.value[frameIndex], 0, 0)

      previewFrameIndex++
    }
  }

  if (isPlaying.value) {
    previewAnimationId = requestAnimationFrame(animatePreview)
  }
}

function togglePreview() {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    lastFrameTime = performance.now()
    previewFrameIndex = 0
    previewAnimationId = requestAnimationFrame(animatePreview)
  } else if (previewAnimationId !== null) {
    cancelAnimationFrame(previewAnimationId)
  }
}

onUnmounted(() => {
  if (previewAnimationId !== null) {
    cancelAnimationFrame(previewAnimationId)
  }
})
</script>

<style scoped lang="scss">
.preview {
  &-canvas {
    cursor: crosshair;
    outline: 2px solid #444;
    background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / 24px 24px;
    image-rendering: pixelated;
  }

  &-controls {
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
      color: #999;
      font-size: 12px;
    }

    button {
      cursor: pointer;
      border: none;
      border-radius: 4px;
      background: #0078d4;
      padding: 8px;
      color: #fff;

      &:hover {
        background: #005a9e;
      }
    }
  }
}
</style>
