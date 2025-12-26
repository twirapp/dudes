<template>
  <editor-card title="Редактор">
    <canvas
      ref="editorCanvasRef"
      class="editor-canvas"
      :width="SPRITE_SIZE"
      :height="SPRITE_SIZE"
      :style="{
        width: `${CANVAS_SCALE * SPRITE_SIZE}px`,
        height: `${CANVAS_SCALE * SPRITE_SIZE}px`,
      }"
      @contextmenu.prevent
      @pointerdown="startDrawing"
      @pointermove="draw"
      @pointerup="stopDrawing"
      @pointerleave="stopDrawing"
    />
  </editor-card>
</template>

<script setup lang="ts">
import { useElementBounding } from '@vueuse/core'
import { hexToRgb } from '@zero-dependency/utils'
import EditorCard from './editor-card.vue'
import { CANVAS_SCALE, SPRITE_SIZE } from './editor-constants'
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
  updateFrameThumbnail,
} = useEditorCanvas()

const canvasBounding = useElementBounding(editorCanvasRef)

function startDrawing(event: PointerEvent) {
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

function saveFrameFromEditor() {
  const ctx = editorContext.value
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  frames.value[currentFrameIndex.value] = imageData

  updateFrameThumbnail(currentFrameIndex.value)
}

function draw(event: MouseEvent) {
  const ctx = editorContext.value

  if (!isDrawing.value || !ctx) return

  const x = Math.floor((event.clientX - canvasBounding.left.value) / CANVAS_SCALE)
  const y = Math.floor((event.clientY - canvasBounding.top.value) / CANVAS_SCALE)

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
.editor-canvas {
  cursor: crosshair;
  outline: 2px solid #444;
  background: repeating-conic-gradient(#2d2d2d 0% 25%, #1e1e1e 0% 50%) 50% / 24px 24px;
  image-rendering: pixelated;
}
</style>
