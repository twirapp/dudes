<script setup lang="ts">
import { TEMPLATES } from '../lib/templates.js'
import type { TemplateId } from '../lib/templates.js'

const props = defineProps<{
  open: boolean
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  select: [id: TemplateId]
  blank: []
  close: []
}>()
</script>

<template>
  <div v-if="props.open" class="overlay">
    <div class="dialog">
      <header class="dialog-header">
        <div>
          <h2>Start a dude</h2>
          <p>Pick a template to redraw, or start from a blank canvas.</p>
        </div>
        <button type="button" class="close" @click="emit('close')">×</button>
      </header>

      <p v-if="props.error" class="load-error">{{ props.error }}</p>

      <div class="cards">
        <button
          v-for="template in TEMPLATES"
          :key="template.id"
          type="button"
          class="card"
          :disabled="props.loading"
          @click="emit('select', template.id)"
        >
          <img :src="template.preview" :alt="template.name" />
          <span>{{ template.name }}</span>
        </button>

        <button
          type="button"
          class="card blank"
          :disabled="props.loading"
          @click="emit('blank')"
        >
          <span class="blank-preview">＋</span>
          <span>Blank canvas</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(6 6 9 / 72%);
  backdrop-filter: blur(6px);
}

.dialog {
  width: min(560px, 100%);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  box-shadow: 0 30px 70px rgb(0 0 0 / 55%);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.dialog-header h2 {
  margin: 0 0 4px;
  font-size: 18px;
  letter-spacing: -0.01em;
}

.dialog-header p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

.load-error {
  margin: 0 0 12px;
  padding: 8px 10px;
  border: 1px solid rgb(248 113 113 / 35%);
  border-radius: 7px;
  background: rgb(248 113 113 / 10%);
  color: #fca5a5;
  font-size: 12px;
}

.close {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.card:hover:not(:disabled) {
  border-color: var(--accent);
}

.card:disabled {
  opacity: 0.5;
  cursor: default;
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.card img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  background: #0d0d11;
  image-rendering: pixelated;
  object-fit: contain;
}

.blank-preview {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px dashed var(--border);
  border-radius: 6px;
  color: var(--muted);
  font-size: 26px;
}
</style>
