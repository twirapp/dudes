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
import EditorCard from '../editor-card.vue'
import { CANVAS_CELL_SIZE, CANVAS_SCALE, SPRITE_SIZE } from '../editor-constants'
import { useAnimationPreview } from './use-animation-preview'

const {
  previewCanvasRef,
  isPlaying,
  fps,
  togglePreview,
} = useAnimationPreview()
</script>

<style scoped lang="scss">
.preview {
  &-canvas {
    outline: 2px solid #444;
    background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / v-bind('CANVAS_CELL_SIZE')
      v-bind('CANVAS_CELL_SIZE');
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
