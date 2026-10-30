import { computed, ref, shallowRef, type ComputedRef, type Ref } from 'vue'

import {
  copyFrame,
  fillArea,
  formatHexColor,
  FRAME_COUNT,
  getPixel,
  isTransparent,
  parseHexColor,
  setPixel,
  TRANSPARENT,
  validateDocument,
  drawLine
} from '@twirapp/dudes-sprite'
import type {
  Layer,
  SpriteDocument,
  ValidationIssue
} from '@twirapp/dudes-sprite'

import { useHistory } from './useHistory.js'

export type EditorTool = 'brush' | 'eraser' | 'fill' | 'eyedropper'

export const DEFAULT_PALETTE = [
  '#FFFFFF',
  '#000000',
  '#D6D6D6',
  '#969696',
  '#201533',
  '#E6AC0C',
  '#FF0000',
  '#3EC7D9'
]

export interface Editor {
  doc: Ref<SpriteDocument>
  revision: Ref<number>
  activeLayer: Ref<Layer>
  activeFrame: Ref<number>
  tool: Ref<EditorTool>
  palette: Ref<string[]>
  onionSkin: Ref<boolean>
  issues: ComputedRef<ValidationIssue[]>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  setLayer: (layer: Layer) => void
  setFrame: (frame: number) => void
  setTool: (tool: EditorTool) => void
  setName: (name: string) => void
  setColor: (hex: string) => void
  addColor: (hex: string) => void
  beginStroke: () => void
  endStroke: () => void
  paint: (x: number, y: number) => void
  paintLine: (x0: number, y0: number, x1: number, y1: number) => void
  undo: () => void
  redo: () => void
  saveFrameAndNext: () => boolean
  replaceDocument: (next: SpriteDocument) => void
}

function normalizeHex(hex: string): string {
  return formatHexColor(parseHexColor(hex)).slice(0, 7)
}

export function useEditor(initial: SpriteDocument): Editor {
  const doc = shallowRef(initial)
  const revision = ref(0)
  const activeLayer = ref<Layer>('body')
  const activeFrame = ref(0)
  const tool = ref<EditorTool>('brush')
  const palette = ref<string[]>([...DEFAULT_PALETTE])
  const onionSkin = ref(false)
  const isStroking = ref(false)
  const history = useHistory(initial)

  const issues = computed<ValidationIssue[]>(() => {
    revision.value
    return validateDocument(doc.value)
  })

  function touch(): void {
    revision.value++
  }

  function setLayer(layer: Layer): void {
    activeLayer.value = layer
  }

  function setFrame(frame: number): void {
    if (frame < 0 || frame >= FRAME_COUNT) return
    activeFrame.value = frame
  }

  function setTool(next: EditorTool): void {
    tool.value = next
  }

  function setName(name: string): void {
    doc.value.name = name.trim() || 'Untitled'
    touch()
  }

  function setColor(hex: string): void {
    palette.value[0] = normalizeHex(hex)
  }

  function addColor(hex: string): void {
    const color = normalizeHex(hex)
    if (palette.value.includes(color)) return
    palette.value.push(color)
  }

  function beginStroke(): void {
    if (isStroking.value) return
    if (tool.value === 'eyedropper') return
    history.push(doc.value)
    isStroking.value = true
  }

  function endStroke(): void {
    isStroking.value = false
  }

  function applyColor(x: number, y: number, color: number): void {
    setPixel(doc.value, activeLayer.value, activeFrame.value, x, y, color)
  }

  function paint(x: number, y: number): void {
    switch (tool.value) {
      case 'brush':
        applyColor(x, y, parseHexColor(palette.value[0]))
        break
      case 'eraser':
        applyColor(x, y, TRANSPARENT)
        break
      case 'fill':
        fillArea(
          doc.value,
          activeLayer.value,
          activeFrame.value,
          x,
          y,
          parseHexColor(palette.value[0])
        )
        break
      case 'eyedropper': {
        const picked = getPixel(
          doc.value,
          activeLayer.value,
          activeFrame.value,
          x,
          y
        )
        if (!isTransparent(picked)) {
          setColor(formatHexColor(picked))
        }
        return
      }
    }

    touch()
  }

  function paintLine(x0: number, y0: number, x1: number, y1: number): void {
    if (tool.value === 'brush' || tool.value === 'eraser') {
      drawLine(
        doc.value,
        activeLayer.value,
        activeFrame.value,
        x0,
        y0,
        x1,
        y1,
        tool.value === 'brush'
          ? parseHexColor(palette.value[0])
          : TRANSPARENT
      )
      touch()
      return
    }

    paint(x1, y1)
  }

  function undo(): void {
    const previous = history.undo(doc.value)
    if (!previous) return
    doc.value = previous
    touch()
  }

  function redo(): void {
    const next = history.redo(doc.value)
    if (!next) return
    doc.value = next
    touch()
  }

  function saveFrameAndNext(): boolean {
    if (activeFrame.value >= FRAME_COUNT - 1) return false

    history.push(doc.value)
    copyFrame(doc.value, activeFrame.value, activeFrame.value + 1)
    activeFrame.value++
    touch()
    return true
  }

  function replaceDocument(next: SpriteDocument): void {
    history.reset()
    doc.value = next
    activeFrame.value = 0
    activeLayer.value = 'body'
    isStroking.value = false
    touch()
  }

  return {
    doc,
    revision,
    activeLayer,
    activeFrame,
    tool,
    palette,
    onionSkin,
    issues,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    setLayer,
    setFrame,
    setTool,
    setName,
    setColor,
    addColor,
    beginStroke,
    endStroke,
    paint,
    paintLine,
    undo,
    redo,
    saveFrameAndNext,
    replaceDocument
  }
}
