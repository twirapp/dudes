<template>
  <div class="editor">
    <div class="editor-container">
      <editor-toolbar />

      <editor-canvas />

      <editor-animation-preview />
    </div>

    <editor-layers />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import EditorAnimationPreview from './editor-animation-preview.vue'
import EditorCanvas from './editor-canvas.vue'
import EditorLayers from './editor-layers.vue'
import EditorToolbar from './editor-toolbar.vue'
import { provideEditor } from './use-editor'
import { useEditorCanvas } from './use-editor-canvas'
import type { DudesFrameTag } from '@twirapp/dudes-vue'
import type { EditorTool } from './editor-constants'

const tool = ref<EditorTool>('draw')
const colorLeft = ref('#ffffff')
const colorRight = ref('#000000')
const drawingKey = ref(0)

const fps = ref(4)
const currentAnimation = ref<DudesFrameTag>('idle')
const currentFrameIndex = ref(0)
const isPlaying = ref(false)
const isDrawing = ref(false)
const frames = ref<ImageData[]>([])

provideEditor({
  tool,
  colorLeft,
  colorRight,
  drawingKey,
  isDrawing,
  isPlaying,
  fps,
  frames,
  currentAnimation,
  currentFrameIndex,
})

const {
  editorContext,
  initFrames,
  loadFrameToEditor,
} = useEditorCanvas()

watch(currentFrameIndex, () => {
  loadFrameToEditor()
})

onMounted(() => {
  if (!editorContext.value) return
  initFrames()
})
</script>

<style scoped lang="scss">
.editor {
  background: #1e1e1e;
  padding: 16px;
  height: 100%;
  color: #fff;

  &-container {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }
}
</style>
