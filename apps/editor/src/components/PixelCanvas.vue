<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { renderFrame } from '@twirapp/dudes-sprite'
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const SCALE = 12
let previous: HTMLCanvasElement | null = null

function drawFrame(
  context: CanvasRenderingContext2D,
  target: HTMLCanvasElement,
  frame: number
): void {
  const image = new ImageData(
    new Uint8ClampedArray(renderFrame(props.editor.doc.value, frame)),
    32,
    32
  )
  target.getContext('2d')!.putImageData(image, 0, 0)
  context.drawImage(target, 0, 0, 32 * SCALE, 32 * SCALE)
}

function draw(): void {
  const element = canvas.value
  if (!element) return

  const context = element.getContext('2d')
  if (!context) return

  context.imageSmoothingEnabled = false
  context.fillStyle = '#15151a'
  context.fillRect(0, 0, element.width, element.height)

  if (!previous) {
    previous = document.createElement('canvas')
    previous.width = 32
    previous.height = 32
  }

  const frame = props.editor.activeFrame.value

  if (props.editor.onionSkin.value) {
    const previousFrame = (frame + 8) % 9
    const onion = document.createElement('canvas')
    onion.width = 32
    onion.height = 32
    const onionImage = new ImageData(
      new Uint8ClampedArray(renderFrame(props.editor.doc.value, previousFrame)),
      32,
      32
    )
    onion.getContext('2d')!.putImageData(onionImage, 0, 0)
    context.globalAlpha = 0.3
    context.drawImage(onion, 0, 0, 32 * SCALE, 32 * SCALE)
    context.globalAlpha = 1
  }

  drawFrame(context, previous, frame)
}

function cellFromEvent(event: PointerEvent): [number, number] {
  const element = canvas.value!
  const rect = element.getBoundingClientRect()
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * 32)
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * 32)
  return [
    Math.min(31, Math.max(0, x)),
    Math.min(31, Math.max(0, y))
  ]
}

let stroking = false
let lastCell: [number, number] | null = null

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) return

  try {
    canvas.value?.setPointerCapture(event.pointerId)
  } catch {
    // pointer capture is best-effort
  }

  stroking = true
  const cell = cellFromEvent(event)
  lastCell = cell
  if (props.editor.tool.value !== 'eyedropper') {
    props.editor.beginStroke()
  }
  props.editor.paint(cell[0], cell[1])
}

function onPointerMove(event: PointerEvent): void {
  if (!stroking || !lastCell) return
  const cell = cellFromEvent(event)
  if (cell[0] === lastCell[0] && cell[1] === lastCell[1]) return
  props.editor.paintLine(lastCell[0], lastCell[1], cell[0], cell[1])
  lastCell = cell
}

function onPointerUp(): void {
  if (!stroking) return
  stroking = false
  lastCell = null
  props.editor.endStroke()
}

watch(
  [
    () => props.editor.revision.value,
    () => props.editor.activeFrame.value,
    () => props.editor.onionSkin.value,
    () => props.editor.activeLayer.value
  ],
  draw
)

onMounted(draw)
</script>

<template>
  <div class="canvas-frame">
    <canvas
      ref="canvas"
      :width="32 * SCALE"
      :height="32 * SCALE"
      class="pixel-canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <div class="pixel-grid" />
  </div>
</template>

<style scoped>
.canvas-frame {
  position: relative;
  width: min(60vh, 100%);
  aspect-ratio: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #0f0f13;
  box-shadow: 0 18px 40px rgb(0 0 0 / 35%);
}

.pixel-canvas {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  cursor: crosshair;
  image-rendering: pixelated;
  touch-action: none;
}

.pixel-grid {
  position: absolute;
  inset: 10px;
  border-radius: 4px;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 6%) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 6%) 1px, transparent 1px);
  background-size: calc(100% / 32) calc(100% / 32);
}
</style>
