<script setup lang="ts">
import { computed } from 'vue'

import { LAYERS } from '@twirapp/dudes-sprite'
import type { Layer } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()

const layers = computed<Layer[]>(() => [...LAYERS].reverse())

const labels: Record<Layer, string> = {
  body: 'Body',
  eyes: 'Eyes',
  mouth: 'Mouth',
  hat: 'Hat',
  cosmetics: 'Cosmetics'
}
</script>

<template>
  <div class="panel-block">
    <h2>Layers</h2>
    <div class="layer-list">
      <button
        v-for="layer in layers"
        :key="layer"
        type="button"
        class="layer-item"
        :class="{ active: props.editor.activeLayer.value === layer }"
        @click="props.editor.setLayer(layer)"
      >
        <span class="layer-index">{{ LAYERS.indexOf(layer) + 1 }}</span>
        <span>{{ labels[layer] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.layer-item:hover {
  background: var(--surface-2);
}

.layer-item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.layer-index {
  width: 18px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}

.layer-item.active .layer-index {
  color: var(--accent);
}
</style>
