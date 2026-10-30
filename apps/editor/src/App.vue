<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { createDocument, FRAME_TAGS } from '@twirapp/dudes-sprite'

import AnimationPreview from './components/AnimationPreview.vue'
import FrameStrip from './components/FrameStrip.vue'
import IssuesPanel from './components/IssuesPanel.vue'
import LayerPanel from './components/LayerPanel.vue'
import PalettePanel from './components/PalettePanel.vue'
import PixelCanvas from './components/PixelCanvas.vue'
import ProjectBar from './components/ProjectBar.vue'
import TemplatePicker from './components/TemplatePicker.vue'
import ToolsPanel from './components/ToolsPanel.vue'
import { useEditor } from './composables/useEditor.js'
import { useProjects } from './composables/useProjects.js'
import { idbStorage } from './lib/storage.js'
import { loadTemplate } from './lib/templates.js'
import type { TemplateId } from './lib/templates.js'

const editor = useEditor(createDocument('Untitled'))
const projects = useProjects(idbStorage)
const showTemplates = ref(false)
const templateLoading = ref(false)
const templateError = ref('')

const currentTag = computed(
  () =>
    FRAME_TAGS.find(
      (tag) =>
        editor.activeFrame.value >= tag.from &&
        editor.activeFrame.value <= tag.to
    )?.name ?? 'idle'
)

onMounted(async () => {
  await projects.refresh()
  const latest = projects.projects.value[0]
  if (latest) {
    const doc = await projects.open(latest.id)
    if (doc) {
      editor.replaceDocument(doc)
      return
    }
  }

  showTemplates.value = true
})

function openTemplates(): void {
  templateError.value = ''
  showTemplates.value = true
}

async function ensureProject(): Promise<void> {
  if (projects.currentId.value) return
  await projects.create(editor.doc.value.name, editor.doc.value)
}

async function closeTemplates(): Promise<void> {
  showTemplates.value = false
  await ensureProject()
}

async function startBlank(): Promise<void> {
  templateError.value = ''

  if (!(await projects.flush(editor.doc.value))) {
    templateError.value =
      projects.error.value ?? 'Could not save the current project'
    return
  }

  const doc = createDocument('Untitled')
  if (!(await projects.create(doc.name, doc))) {
    templateError.value =
      projects.error.value ?? 'Could not create the project'
    return
  }

  showTemplates.value = false
  editor.replaceDocument(doc)
}

async function selectTemplate(id: TemplateId): Promise<void> {
  templateLoading.value = true
  templateError.value = ''

  try {
    const doc = await loadTemplate(id)

    if (!(await projects.flush(editor.doc.value))) {
      throw new Error(projects.error.value ?? 'Could not save the current project')
    }
    if (!(await projects.create(doc.name, doc))) {
      throw new Error(projects.error.value ?? 'Could not create the project')
    }

    editor.replaceDocument(doc)
    showTemplates.value = false
  } catch (cause) {
    templateError.value =
      cause instanceof Error ? cause.message : String(cause)
  } finally {
    templateLoading.value = false
  }
}

watch(
  () => editor.revision.value,
  () => {
    if (!projects.currentId.value) return
    projects.scheduleAutosave(editor.doc.value)
  }
)

function flushPending(): void {
  if (!projects.currentId.value) return
  void projects.flush(editor.doc.value)
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'hidden') flushPending()
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return
  }

  if (event.key === 'b' || event.key === 'B') editor.setTool('brush')
  if (event.key === 'e' || event.key === 'E') editor.setTool('eraser')
  if (event.key === 'f' || event.key === 'F') editor.setTool('fill')
  if (event.key === 'i' || event.key === 'I') editor.setTool('eyedropper')

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    if (event.shiftKey) editor.redo()
    else editor.undo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  flushPending()
})
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">dudes <span>editor</span></div>
      <ProjectBar :editor="editor" :projects="projects" />
      <button type="button" class="templates-button" @click="openTemplates">
        Templates
      </button>
      <div class="topbar-meta">
        {{ currentTag }} · frame {{ editor.activeFrame.value }} · 32×32
      </div>
    </header>

    <p v-if="projects.error.value" class="save-error">
      Autosave failed: {{ projects.error.value }}. Export a backup.
      <button type="button" @click="projects.clearError()">×</button>
    </p>

    <main class="workspace">
      <aside class="side">
        <LayerPanel :editor="editor" />
      </aside>

      <section class="stage">
        <PixelCanvas :editor="editor" />
        <FrameStrip :editor="editor" />
      </section>

      <aside class="side right">
        <AnimationPreview :editor="editor" />
        <ToolsPanel :editor="editor" />
        <PalettePanel :editor="editor" />
        <IssuesPanel :editor="editor" />
      </aside>
    </main>

    <TemplatePicker
      :open="showTemplates"
      :loading="templateLoading"
      :error="templateError"
      @select="selectTemplate"
      @blank="startBlank"
      @close="closeTemplates"
    />
  </div>
</template>
