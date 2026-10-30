<script setup lang="ts">
import { FRAME_TAGS } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

import FrameThumb from './FrameThumb.vue'

const props = defineProps<{ editor: Editor }>()

const tags = FRAME_TAGS.flatMap((tag) =>
  Array.from({ length: tag.to - tag.from + 1 }, () => tag.name)
)
</script>

<template>
  <div class="frame-strip">
    <button
      v-for="(tag, frame) in tags"
      :key="frame"
      type="button"
      class="frame-item"
      :class="{ active: props.editor.activeFrame.value === frame }"
      :title="`${tag} ${frame}`"
      @click="props.editor.setFrame(frame)"
    >
      <span class="frame-canvas">
        <FrameThumb :editor="props.editor" :frame="frame" />
      </span>
      <span class="frame-label">{{ tag }} {{ frame }}</span>
    </button>
  </div>
</template>

<style scoped>
.frame-strip {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.frame-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
}

.frame-item:hover {
  background: var(--surface-2);
}

.frame-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--text);
}

.frame-canvas {
  display: block;
  aspect-ratio: 1;
  border-radius: 4px;
  background: repeating-conic-gradient(
      #2a2a33 0% 25%,
      #1d1d24 0% 50%
    )
    50% / 10px 10px;
  overflow: hidden;
}

.frame-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
