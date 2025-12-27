<template>
  <div
    class="editor-viewport"
    :class="{
      panning: isPanning,
    }"
    @wheel.prevent="handleWheel"
    @pointerdown="handleViewportPointerDown"
    @pointermove="handleViewportPointerMove"
    @pointerup="handleViewportPointerUp"
    @pointerleave="handleViewportPointerUp"
  >
    <canvas
      ref="editorCanvasRef"
      class="editor-canvas"
      :width="SPRITE_SIZE"
      :height="SPRITE_SIZE"
      :style="{
        width: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        height: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`,
      }"
      @contextmenu.prevent
      @pointerdown="startDrawing"
      @pointermove="handleCanvasPointerMove"
      @pointerup="stopDrawing"
      @pointerleave="handleCanvasPointerLeave"
    />
    <canvas
      ref="editorPreviewCanvasRef"
      class="preview-canvas"
      :width="SPRITE_SIZE"
      :height="SPRITE_SIZE"
      :style="{
        width: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        height: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom})`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { hexToRgb } from '@zero-dependency/utils'
import { ref } from 'vue'
import {
  CANVAS_CELL_SIZE,
  CANVAS_SCALE,
  MIDDLE_BUTTON,
  SPRITE_SIZE,
} from './editor-constants'
import { useEditor } from './use-editor'
import { useEditorCanvas } from './use-editor-canvas'

const {
  tool,
  colorLeft,
  colorRight,
  isDrawing,
  drawingKey,
  frames,
  currentFrameIndex,
} = useEditor()

const {
  editorContext,
  editorCanvasRef,
  editorPreviewCanvasRef,
  editorPreviewContext,
  updateFrameThumbnail,
} = useEditorCanvas()

const canvasBounding = useElementBounding(editorCanvasRef)

const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)

const isPanning = ref(false)
const lastPanX = ref(0)
const lastPanY = ref(0)

const hoverX = ref<number | null>(null)
const hoverY = ref<number | null>(null)

function handleViewportPointerDown(event: PointerEvent) {
  if (event.button === MIDDLE_BUTTON || event.shiftKey) {
    isPanning.value = true
    lastPanX.value = event.clientX
    lastPanY.value = event.clientY
    event.stopPropagation()
    event.preventDefault()
  }
}

function handleViewportPointerMove(event: PointerEvent) {
  if (!isPanning.value) return
  panX.value += event.clientX - lastPanX.value
  panY.value += event.clientY - lastPanY.value
  lastPanX.value = event.clientX
  lastPanY.value = event.clientY
  event.stopPropagation()
  event.preventDefault()
}

function handleViewportPointerUp() {
  isPanning.value = false
}

function handleWheel(event: WheelEvent) {
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.5, Math.min(10, zoom.value * delta))
}

function startDrawing(event: PointerEvent) {
  if (isPanning.value) {
    event.stopPropagation()
    event.preventDefault()
    return
  }

  isDrawing.value = true
  drawingKey.value = event.button
  draw(event)
}

function stopDrawing() {
  if (isDrawing.value) {
    saveFrameFromEditor()
  }
  isDrawing.value = false
}

function handleCanvasPointerMove(event: PointerEvent) {
  updateHoverPreview(event)
  draw(event)
}

function handleCanvasPointerLeave() {
  clearHoverPreview()
  stopDrawing()
}

function updateHoverPreview(event: MouseEvent) {
  if (isPanning.value || isDrawing.value) {
    clearHoverPreview()
    return
  }

  const x = Math.floor((event.clientX - canvasBounding.left.value) / (CANVAS_SCALE * zoom.value))
  const y = Math.floor((event.clientY - canvasBounding.top.value) / (CANVAS_SCALE * zoom.value))

  if (x < 0 || x >= SPRITE_SIZE || y < 0 || y >= SPRITE_SIZE) {
    clearHoverPreview()
    return
  }

  hoverX.value = x
  hoverY.value = y
  drawHoverPreview()
}

function drawHoverPreview() {
  if (hoverX.value === null || hoverY.value === null) return

  const ctx = editorPreviewContext.value!
  ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  ctx.fillStyle = colorLeft.value
  ctx.fillRect(hoverX.value, hoverY.value, 1, 1)
}

function clearHoverPreview() {
  hoverX.value = null
  hoverY.value = null
  editorPreviewContext.value!.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
}

function saveFrameFromEditor() {
  const imageData = editorContext.value!.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  frames.value[currentFrameIndex.value] = imageData
  updateFrameThumbnail(currentFrameIndex.value)
}

function draw(event: MouseEvent) {
  if (!isDrawing.value || isPanning.value || drawingKey.value === MIDDLE_BUTTON || event.shiftKey) {
    return
  }

  const ctx = editorContext.value!
  const x = Math.floor((event.clientX - canvasBounding.left.value) / (CANVAS_SCALE * zoom.value))
  const y = Math.floor((event.clientY - canvasBounding.top.value) / (CANVAS_SCALE * zoom.value))

  if (x < 0 || x >= SPRITE_SIZE || y < 0 || y >= SPRITE_SIZE) return

  if (tool.value === 'erase') {
    ctx.clearRect(x, y, 1, 1)
    return
  }

  const color = drawingKey.value === 0
    ? colorLeft.value
    : colorRight.value

  if (tool.value === 'draw') {
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
  } else if (tool.value === 'fill') {
    floodFill(x, y, color)
  }
}

function floodFill(startX: number, startY: number, fillColor: string) {
  const ctx = editorContext.value!
  const imageData = ctx.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  const data = imageData.data

  const startPos = (startY * SPRITE_SIZE + startX) * 4
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
    const pos = (y * SPRITE_SIZE + x) * 4

    if (visited.has(pos) || x < 0 || x >= SPRITE_SIZE || y < 0 || y >= SPRITE_SIZE) continue
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
</script>

<style scoped lang="scss">
.editor-viewport {
  --editor-cursor: crosshair;

  position: relative;
  cursor: var(--editor-cursor);
  border-radius: 8px;
  background: #2d2d2d;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &.panning {
    --editor-cursor: move;
  }
}

.editor-canvas,
.preview-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  outline: 2px solid #444;
  background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / v-bind('CANVAS_CELL_SIZE')
    v-bind('CANVAS_CELL_SIZE');
  image-rendering: pixelated;
}

.preview-canvas {
  outline: none;
  background: transparent;
  pointer-events: none;
}
</style>
