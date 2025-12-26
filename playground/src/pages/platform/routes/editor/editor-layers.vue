<template>
  <div class="timeline">
    <h3>Кадры</h3>
    <div class="frames-grid">
      <div
        v-for="index in TOTAL_FRAMES"
        :key="index - 1"
        class="frame-thumbnail"
        :class="{ active: currentRange.from <= index - 1 && index - 1 <= currentRange.to }"
        @click="setLayerFrameIndex(index - 1)"
      >
        <canvas
          :ref="(ref) => (frameCanvasRefs[index - 1] = ref as HTMLCanvasElement)"
          :width="SPRITE_SIZE"
          :height="SPRITE_SIZE"
        />
        <span>{{ index }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { entries } from '@zero-dependency/utils'
import { ANIMATION_RANGES, SPRITE_SIZE, TOTAL_FRAMES } from './editor-constants'
import { useEditor } from './use-editor'
import { useEditorCanvas } from './use-editor-canvas'

const {
  frameCanvasRefs,
} = useEditorCanvas()

const {
  currentRange,
  currentAnimation,
  currentFrameIndex,
} = useEditor()

function setLayerFrameIndex(frameIndex: number) {
  const ranges = entries(ANIMATION_RANGES)
  for (const [animation, range] of ranges) {
    if (range.from <= frameIndex && frameIndex <= range.to) {
      currentAnimation.value = animation
      currentFrameIndex.value = frameIndex
      break
    }
  }
}
</script>

<style scoped lang="scss">
.frame-thumbnail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  cursor: pointer;
  border: 2px solid #444;
  border-radius: 4px;
  background: #1e1e1e;
  padding: 8px;

  &:hover {
    border-color: #666;
  }

  &.active {
    border-color: #0078d4;
    background: #2a2a2a;
  }

  canvas {
    background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / 8px 8px;
    image-rendering: pixelated;
    width: 64px;
    height: 64px;
  }

  span {
    color: #999;
    font-size: 11px;
  }
}

.timeline {
  border-radius: 8px;
  background: #2d2d2d;
  padding: 15px;

  h3 {
    margin: 0 0 15px 0;
    color: #999;
    font-size: 14px;
  }
}

.frames-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}
</style>
