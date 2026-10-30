<script setup lang="ts">
import { FRAME_COUNT } from '@twirapp/dudes-sprite'
import type { Editor, EditorTool } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()

const tools: { id: EditorTool; label: string; key: string }[] = [
  { id: 'brush', label: 'Brush', key: 'B' },
  { id: 'eraser', label: 'Eraser', key: 'E' },
  { id: 'fill', label: 'Fill', key: 'F' },
  { id: 'eyedropper', label: 'Pick', key: 'I' }
]

const isLastFrame = () => props.editor.activeFrame.value === FRAME_COUNT - 1

function toggleOnion(event: Event): void {
  props.editor.onionSkin.value = (event.target as HTMLInputElement).checked
}
</script>

<template>
  <div class="panel-block">
    <h2>Tools</h2>
    <div class="tool-grid">
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        class="tool-button"
        :class="{ active: props.editor.tool.value === tool.id }"
        @click="props.editor.setTool(tool.id)"
      >
        <span>{{ tool.label }}</span>
        <kbd>{{ tool.key }}</kbd>
      </button>
    </div>

    <div class="color-row">
      <span class="color-preview" :style="{ background: props.editor.palette.value[0] }" />
      <span class="color-value">{{ props.editor.palette.value[0] }}</span>
    </div>

    <div class="tool-grid two">
      <button
        type="button"
        class="tool-button"
        :disabled="!props.editor.canUndo.value"
        @click="props.editor.undo()"
      >
        Undo
      </button>
      <button
        type="button"
        class="tool-button"
        :disabled="!props.editor.canRedo.value"
        @click="props.editor.redo()"
      >
        Redo
      </button>
    </div>

    <button
      type="button"
      class="save-button"
      :disabled="isLastFrame()"
      @click="props.editor.saveFrameAndNext()"
    >
      {{ isLastFrame() ? 'Last frame' : 'Save frame → next' }}
    </button>

    <label class="toggle">
      <input
        type="checkbox"
        :checked="props.editor.onionSkin.value"
        @change="toggleOnion"
      />
      Show previous frame
    </label>
  </div>
</template>

<style scoped>
.tool-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.tool-grid.two {
  grid-template-columns: 1fr 1fr;
  margin-top: 4px;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.tool-button:hover:not(:disabled) {
  border-color: var(--muted);
}

.tool-button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.tool-button:disabled {
  opacity: 0.4;
  cursor: default;
}

kbd {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 10px 0;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-2);
}

.color-preview {
  width: 22px;
  height: 22px;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 5px;
}

.color-value {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
}

.save-button {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  border: 1px solid var(--accent);
  border-radius: 7px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.save-button:hover:not(:disabled) {
  background: rgb(250 204 21 / 18%);
}

.save-button:disabled {
  border-color: var(--border);
  background: var(--surface-2);
  color: var(--muted);
  cursor: default;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
}

.toggle input {
  accent-color: var(--accent);
}
</style>
