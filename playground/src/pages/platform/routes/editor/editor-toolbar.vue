<template>
  <div class="editor-toolbar">
    <div class="color-picker">
      <label>Цвет:</label>
      <input
        v-model="colorLeft"
        type="color"
      >
      <input
        v-model="colorRight"
        type="color"
      >
    </div>

    <div class="tool-buttons">
      <button
        v-for="editorTool in EDITOR_TOOLS"
        :key="editorTool"
        :class="{ active: tool === editorTool }"
        @click="tool = editorTool"
      >
        {{ editorTool }}
      </button>
    </div>

    <div class="animation-selector">
      <label>Анимация:</label>
      <select v-model="currentAnimation">
        <option value="idle">
          Idle (1-3)
        </option>
        <option value="jump">
          Jump (4)
        </option>
        <option value="fall">
          Fall (5)
        </option>
        <option value="land">
          Land (6)
        </option>
        <option value="walk">
          Walk (7-9)
        </option>
      </select>
    </div>

    <div class="actions">
      <button @click="clearCanvas">
        Очистить
      </button>
      <button @click="exportSprite">
        Экспорт PNG
      </button>
      <button @click="importSprite">
        Импорт
      </button>
      <input
        v-show="false"
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleImport"
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EDITOR_TOOLS, SPRITE_SIZE, TOTAL_FRAMES } from './editor-constants'
import { useEditor } from './use-editor'
import { useEditorCanvas } from './use-editor-canvas'

const {
  editorContext,
  loadSprite,
  saveFrameFromEditor,
} = useEditorCanvas()

const {
  tool,
  frames,
  colorLeft,
  colorRight,
  currentAnimation,
} = useEditor()

const fileInput = ref<HTMLInputElement | null>(null)

function clearCanvas() {
  const ctx = editorContext.value
  if (!ctx) return

  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  saveFrameFromEditor(ctx)
}

function exportSprite() {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = SPRITE_SIZE * TOTAL_FRAMES
  exportCanvas.height = SPRITE_SIZE
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  frames.value.forEach((frame, index) => {
    ctx.putImageData(frame, index * SPRITE_SIZE, 0)
  })

  exportCanvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sprite-sheet.png'
    a.click()
    URL.revokeObjectURL(url)
  })
}

function importSprite() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const fileUrl = URL.createObjectURL(file)
  loadSprite(fileUrl)
}
</script>

<style scoped lang="scss">
.editor-toolbar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-radius: 8px;
  background: #2d2d2d;
  padding: 15px;
  min-width: 200px;

  .color-picker {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  label {
    display: block;
    color: #999;
    font-size: 12px;
  }

  input[type='color'] {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    width: 100%;
    height: 40px;
  }

  input[type='range'] {
    width: 100%;
  }

  select {
    border: 1px solid #444;
    border-radius: 4px;
    background: #1e1e1e;
    padding: 8px;
    width: 100%;
    color: #fff;
  }
}

.tool-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;

  button {
    transition: all 0.2s;
    cursor: pointer;
    border: 1px solid #444;
    border-radius: 4px;
    background: #1e1e1e;
    padding: 8px;
    color: #fff;

    &:hover {
      background: #333;
    }

    &.active {
      border-color: #0078d4;
      background: #0078d4;
    }
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 5px;

  button {
    transition: background 0.2s;
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
</style>
