<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { createDocument } from '@twirapp/dudes-sprite'

import type { Projects } from '../composables/useProjects.js'
import type { Editor } from '../composables/useEditor.js'
import {
  assertExportable,
  downloadBytes,
  exportPackageBytes,
  importPackageBytes,
  packageFileName,
  readFileBytes
} from '../lib/files.js'

const props = defineProps<{ editor: Editor; projects: Projects }>()

const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')

const firstError = computed(
  () =>
    props.editor.issues.value.find((issue) => issue.severity === 'error')
      ?.message ?? ''
)

function rename(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  props.editor.setName(value)
  error.value = ''
  void props.projects.saveNow(props.editor.doc.value)
}

async function newProject(): Promise<void> {
  error.value = ''
  if (!(await props.projects.flush(props.editor.doc.value))) {
    error.value = props.projects.error.value ?? 'Could not save the project'
    return
  }

  const doc = createDocument('Untitled')
  if (!(await props.projects.create(doc.name, doc))) {
    error.value = props.projects.error.value ?? 'Could not create the project'
    return
  }

  props.editor.replaceDocument(doc)
}

async function openProject(event: Event): Promise<void> {
  const id = (event.target as HTMLSelectElement).value
  if (!id || id === props.projects.currentId.value) return

  error.value = ''
  if (!(await props.projects.flush(props.editor.doc.value))) {
    error.value = props.projects.error.value ?? 'Could not save the project'
    return
  }

  const doc = await props.projects.open(id)
  if (doc) props.editor.replaceDocument(doc)
}

async function removeProject(): Promise<void> {
  const id = props.projects.currentId.value
  if (!id) return
  if (!window.confirm('Delete this project?')) return

  await props.projects.remove(id)
  await newProject()
}

function exportProject(): void {
  try {
    assertExportable(props.editor.doc.value)
    const bytes = exportPackageBytes(props.editor.doc.value)
    downloadBytes(bytes, packageFileName(props.editor.doc.value.name))
    error.value = ''
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }
}

async function importProject(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const doc = await importPackageBytes(await readFileBytes(file))

    if (!(await props.projects.flush(props.editor.doc.value))) {
      throw new Error(props.projects.error.value ?? 'Could not save the project')
    }
    if (!(await props.projects.create(doc.name, doc))) {
      throw new Error(props.projects.error.value ?? 'Could not create the project')
    }

    props.editor.replaceDocument(doc)
    error.value = ''
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    input.value = ''
  }
}

watch(
  () => props.projects.currentId.value,
  () => {
    error.value = ''
  }
)
</script>

<template>
  <div class="project-bar">
    <input
      class="name-input"
      :value="props.editor.doc.value.name"
      aria-label="Project name"
      @change="rename"
    />

    <select
      class="project-select"
      :value="props.projects.currentId.value ?? ''"
      aria-label="Open project"
      @change="openProject"
    >
      <option
        v-for="project in props.projects.projects.value"
        :key="project.id"
        :value="project.id"
      >
        {{ project.name }}
      </option>
    </select>

    <button type="button" class="bar-button" @click="newProject">New</button>
    <button type="button" class="bar-button" @click="removeProject">
      Delete
    </button>

    <button
      type="button"
      class="bar-button"
      @click="fileInput?.click()"
    >
      Import
    </button>
    <input
      ref="fileInput"
      type="file"
      accept=".zip,application/zip"
      class="hidden-input"
      @change="importProject"
    />

    <button
      type="button"
      class="bar-button primary"
      :disabled="Boolean(firstError)"
      :title="firstError || 'Export dude package'"
      @click="exportProject"
    >
      Export
    </button>

    <span v-if="error || firstError" class="bar-error">
      {{ error || firstError }}
    </span>
  </div>
</template>

<style scoped>
.project-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.name-input {
  width: 150px;
  padding: 5px 9px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--mono);
  font-size: 12px;
}

.name-input:focus {
  border-color: var(--accent);
  outline: none;
}

.project-select {
  max-width: 150px;
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.bar-button {
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.bar-button:hover:not(:disabled) {
  border-color: var(--muted);
}

.bar-button.primary {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.bar-button:disabled {
  opacity: 0.45;
  cursor: default;
}

.hidden-input {
  display: none;
}

.bar-error {
  max-width: 320px;
  overflow: hidden;
  color: #fca5a5;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
