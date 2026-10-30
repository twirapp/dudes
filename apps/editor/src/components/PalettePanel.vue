<script setup lang="ts">
import { computed, ref } from 'vue'

import { parseHexColor } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()

const custom = ref('#ffffff')

const activeColor = computed(() => props.editor.palette.value[0])

const isGrayscale = computed(() => {
  const color = parseHexColor(activeColor.value)
  const r = (color >>> 24) & 0xff
  const g = (color >>> 16) & 0xff
  const b = (color >>> 8) & 0xff
  return r === g && g === b
})

const showBodyWarning = computed(
  () => props.editor.activeLayer.value === 'body' && !isGrayscale.value
)

function addCustom(): void {
  props.editor.addColor(custom.value)
  props.editor.setColor(custom.value)
}
</script>

<template>
  <div class="panel-block">
    <h2>Palette</h2>

    <div class="swatches">
      <button
        v-for="color in props.editor.palette.value"
        :key="color"
        type="button"
        class="swatch"
        :class="{ active: color === activeColor }"
        :style="{ background: color }"
        :title="color"
        @click="props.editor.setColor(color)"
      />
    </div>

    <div class="custom-row">
      <input v-model="custom" type="color" aria-label="Custom color" />
      <button type="button" class="add-button" @click="addCustom">Add</button>
    </div>

    <p v-if="showBodyWarning" class="warning">
      Body must be grayscale for tinting — this color will look muddy in the
      bot.
    </p>
  </div>
</template>

<style scoped>
.swatches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.swatch {
  aspect-ratio: 1;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 12%);
  cursor: pointer;
}

.swatch.active {
  border-color: var(--accent);
}

.custom-row {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.custom-row input[type='color'] {
  width: 38px;
  height: 30px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-2);
}

.add-button {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.add-button:hover {
  border-color: var(--muted);
}

.warning {
  margin: 10px 0 0;
  padding: 8px;
  border: 1px solid rgb(248 113 113 / 35%);
  border-radius: 6px;
  background: rgb(248 113 113 / 10%);
  color: #fca5a5;
  font-size: 11px;
  line-height: 1.35;
}
</style>
