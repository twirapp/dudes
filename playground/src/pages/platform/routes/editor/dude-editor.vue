<template>
  <div class="sprite-editor">
    <div class="editor-container">
      <!-- Панель инструментов -->
      <div class="toolbar">
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
            v-for="tool in tools"
            :key="tool"
            :class="{ active: currentTool === tool }"
            @click="currentTool = tool"
          >
            {{ tool }}
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
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleImport"
          >
        </div>
      </div>

      <!-- Canvas редактор -->
      <div class="canvas-section">
        <h3>Редактор (32x32)</h3>
        <canvas
          ref="editorCanvas"
          width="32"
          height="32"
          :style="{ width: `${canvasScale * 32}px`, height: `${canvasScale * 32}px` }"
          @contextmenu.prevent
          @pointerdown="startDrawing"
          @pointermove="draw"
          @pointerup="stopDrawing"
          @pointerleave="stopDrawing"
        />
      </div>

      <!-- Предпросмотр -->
      <div class="preview-section">
        <h3>Предпросмотр анимации</h3>
        <canvas
          ref="previewCanvas"
          width="32"
          height="32"
          :style="{ width: '180px', height: '180px' }"
        />
        <div class="preview-controls">
          <button @click="togglePreview">
            {{ isPlaying ? 'Пауза' : 'Играть' }}
          </button>
          <label>FPS: {{ fps }}</label>
          <input
            v-model.number="fps"
            type="range"
            min="1"
            max="12"
          >
        </div>
      </div>
    </div>

    <!-- Таймлайн всех кадров -->
    <div class="timeline">
      <h3>Спрайтмапа (все кадры)</h3>
      <div class="frames-grid">
        <div
          v-for="index in countFrames"
          :key="index - 1"
          class="frame-thumbnail"
          :class="{ active: currentRange.from <= index - 1 && index - 1 <= currentRange.to }"
          @click="setLayerFrameIndex(index - 1)"
        >
          <canvas
            :ref="(ref) => (frameCanvases[index - 1] = ref as HTMLCanvasElement)"
            width="32"
            height="32"
          />
          <span>{{ index }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// https://www.perplexity.ai/search/mozhno-sdelat-plavnuiu-smenu-b-7aRpBdvqTIS790uBgxtjUA

// 1. Реализовать слои на спрайте (body, eye, hat, mouth, cosmetic)
// 2. Реализовать undo, redo (история изменений)
// 3. Исправить баг при рисовании (прерывается при резком движении мыши)
// 4. Релизовать шорткаты для рисования (draw, erase, fill)
// 5. Реализовать историю цветов, палитру цветов, смена цвет 1 и цвет 2 (рисование через ЛКМ и ПКМ)
// 6. Добавить функцию выделения объектов на канвасе с возможность ресайзинга и перемещения (CTRL - выделение, SHIFT - ресайз, ALT - перемещение)
// 7. Копирование на канвасе

import { entries } from '@zero-dependency/utils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const countFrames = 9
const tools = ['draw', 'erase', 'fill'] as const
type Tool = typeof tools[number]

type Animation = 'idle' | 'walk' | 'jump' | 'land' | 'fall'

const currentTool = ref<Tool>('draw')

const colorLeft = ref('#ffffff')
const colorRight = ref('#000000')
const drawingMouseButton = ref(0)

const currentAnimation = ref<Animation>('idle')
const currentFrame = ref(0)
const canvasScale = ref(12)
const fps = ref(4)
const isPlaying = ref(false)
const isDrawing = ref(false)

const editorCanvas = ref<HTMLCanvasElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const frameCanvases = ref<(HTMLCanvasElement | null)[]>([])

const frames = ref<ImageData[]>([])

const animationRanges: Record<Animation, { from: number, to: number }> = {
  idle: { from: 0, to: 2 },
  jump: { from: 3, to: 3 },
  fall: { from: 4, to: 4 },
  land: { from: 5, to: 5 },
  walk: { from: 6, to: 8 },
}

const currentRange = computed(() => {
  return animationRanges[currentAnimation.value]
})

let previewAnimationId: number | null = null
let lastFrameTime = 0
let previewFrameIndex = 0

function setLayerFrameIndex(frameIndex: number) {
  const ranges = entries(animationRanges)
  for (const [animation, range] of ranges) {
    if (range.from <= frameIndex && frameIndex <= range.to) {
      currentAnimation.value = animation
      break
    }
  }
}

// Инициализация пустых кадров
function initFrames() {
  const ctx = editorCanvas.value?.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  for (let i = 0; i < countFrames; i++) {
    const imageData = ctx.createImageData(32, 32)
    // Прозрачный фон
    for (let j = 0; j < imageData.data.length; j += 4) {
      imageData.data[j + 3] = 0
    }
    frames.value.push(imageData)
  }
}

// Загрузка текущего кадра в редактор
function loadFrameToEditor() {
  const ctx = editorCanvas.value?.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const frameData = frames.value[currentFrame.value]
  if (frameData) {
    ctx.putImageData(frameData, 0, 0)
  }
}

// Сохранение текущего кадра из редактора
function saveFrameFromEditor() {
  const ctx = editorCanvas.value?.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, 32, 32)
  frames.value[currentFrame.value] = imageData

  // Обновляем превью в таймлайне
  updateFrameThumbnail(currentFrame.value)
}

// Обновление превьюшки кадра в таймлайне
function updateFrameThumbnail(index: number) {
  const canvas = frameCanvases.value[index]
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.putImageData(frames.value[index], 0, 0)
  ctx.imageSmoothingEnabled = false
}

// Рисование
function startDrawing(event: PointerEvent) {
  isDrawing.value = true
  drawingMouseButton.value = event.button
  draw(event)
}

function stopDrawing() {
  if (isDrawing.value) {
    saveFrameFromEditor()
  }
  isDrawing.value = false
}

function draw(e: MouseEvent) {
  if (!isDrawing.value) return

  const canvas = editorCanvas.value
  const ctx = canvas?.getContext('2d', { willReadFrequently: true })
  if (!canvas || !ctx) return

  const rect = canvas.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / canvasScale.value)
  const y = Math.floor((e.clientY - rect.top) / canvasScale.value)

  if (x < 0 || x >= 32 || y < 0 || y >= 32) return

  if (currentTool.value === 'erase') {
    ctx.clearRect(x, y, 1, 1)
    return
  }

  const color = drawingMouseButton.value === 0
    ? colorLeft.value
    : colorRight.value

  if (currentTool.value === 'draw') {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  } else if (currentTool.value === 'fill') {
    floodFill(ctx, x, y, color)
  }
}

// Заливка (простая реализация flood fill)
// eslint-disable-next-line max-params
function floodFill(ctx: CanvasRenderingContext2D, startX: number, startY: number, fillColor: string) {
  const imageData = ctx.getImageData(0, 0, 32, 32)
  const data = imageData.data

  const startPos = (startY * 32 + startX) * 4
  const startR = data[startPos]
  const startG = data[startPos + 1]
  const startB = data[startPos + 2]
  const startA = data[startPos + 3]

  const fillRgb = hexToRgb(fillColor)
  if (!fillRgb) return

  const stack: [number, number][] = [[startX, startY]]
  const visited = new Set<number>()

  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    const pos = (y * 32 + x) * 4

    if (visited.has(pos) || x < 0 || x >= 32 || y < 0 || y >= 32) continue
    visited.add(pos)

    if (
      data[pos] === startR
      && data[pos + 1] === startG
      && data[pos + 2] === startB
      && data[pos + 3] === startA
    ) {
      data[pos] = fillRgb.r
      data[pos + 1] = fillRgb.g
      data[pos + 2] = fillRgb.b
      data[pos + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

// Очистка canvas
function clearCanvas() {
  const ctx = editorCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, 32, 32)
  saveFrameFromEditor()
}

// Экспорт спрайтмапы
function exportSprite() {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 32 * countFrames
  exportCanvas.height = 32
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return

  frames.value.forEach((frame, index) => {
    ctx.putImageData(frame, index * 32, 0)
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

// Импорт спрайтмапы
function importSprite() {
  fileInput.value?.click()
}

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const img = new Image()
  img.onload = () => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = img.width
    tempCanvas.height = img.height
    const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.drawImage(img, 0, 0)

    // Загружаем кадры из спрайтмапы
    for (let i = 0; i < countFrames; i++) {
      const frameData = ctx.getImageData(i * 32, 0, 32, 32)
      frames.value[i] = frameData
      updateFrameThumbnail(i)
    }

    loadFrameToEditor()
  }

  img.src = URL.createObjectURL(file)
}

// Предпросмотр анимации
function animatePreview(timestamp: number) {
  const fpsInterval = 1000 / fps.value
  const elapsed = timestamp - lastFrameTime

  if (elapsed > fpsInterval) {
    lastFrameTime = timestamp - (elapsed % fpsInterval)

    const range = currentRange.value
    const frameCount = range.to - range.from + 1

    const ctx = previewCanvas.value?.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 32, 32)
      ctx.imageSmoothingEnabled = false

      const frameIndex = range.from + (previewFrameIndex % frameCount)
      ctx.putImageData(frames.value[frameIndex], 0, 0)

      previewFrameIndex++
    }
  }

  if (isPlaying.value) {
    previewAnimationId = requestAnimationFrame(animatePreview)
  }
}

function togglePreview() {
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    lastFrameTime = performance.now()
    previewFrameIndex = 0
    previewAnimationId = requestAnimationFrame(animatePreview)
  } else if (previewAnimationId !== null) {
    cancelAnimationFrame(previewAnimationId)
  }
}

// Watchers
watch(currentFrame, () => {
  loadFrameToEditor()
})

watch(currentAnimation, () => {
  currentFrame.value = currentRange.value.from
})

onMounted(() => {
  const ctx = editorCanvas.value?.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingEnabled = false
  }

  const previewCtx = previewCanvas.value?.getContext('2d')
  if (previewCtx) {
    previewCtx.imageSmoothingEnabled = false
  }

  initFrames()
  loadFrameToEditor()

  // Инициализация превьюшек
  for (let i = 0; i < countFrames; i++) {
    updateFrameThumbnail(i)
  }
})

onUnmounted(() => {
  if (previewAnimationId !== null) {
    cancelAnimationFrame(previewAnimationId)
  }
})
</script>

<style scoped lang="scss">
.sprite-editor {
  background: #1e1e1e;
  padding: 20px;
  min-height: 100vh;
  color: #fff;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.editor-container {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 15px;
  border-radius: 8px;
  background: #2d2d2d;
  padding: 15px;
  min-width: 200px;

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

.canvas-section,
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  background: #2d2d2d;
  padding: 15px;

  h3 {
    margin: 0 0 10px 0;
    color: #999;
    font-size: 14px;
  }

  canvas {
    cursor: crosshair;
    border: 2px solid #444;
    background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / 24px 24px;
    image-rendering: pixelated;
  }
}

.preview-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    color: #999;
    font-size: 12px;
  }

  button {
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
</style>
