import { computed, shallowRef } from 'vue'
import { SPRITE_SIZE, TOTAL_FRAMES } from './editor-constants'
import { useEditor } from './use-editor'

const editorCanvasRef = shallowRef<HTMLCanvasElement>()
const previewCanvasRef = shallowRef<HTMLCanvasElement>()
const frameCanvasRefs = shallowRef<HTMLCanvasElement[]>([])

export function useEditorCanvas() {
  const {
    frames,
    currentFrameIndex,
  } = useEditor()

  const editorContext = computed(() => {
    const ctx = editorCanvasRef.value?.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    return ctx
  })

  const previewContext = computed(() => {
    const ctx = previewCanvasRef.value?.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    return ctx
  })

  function saveFrameFromEditor(ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, SPRITE_SIZE, SPRITE_SIZE)
    frames.value[currentFrameIndex.value] = imageData
    updateFrameThumbnail(currentFrameIndex.value)
  }

  function loadFrameToEditor() {
    const ctx = editorContext.value
    if (!ctx) return

    const frameData = frames.value[currentFrameIndex.value]
    if (!frameData) return

    ctx.putImageData(frameData, 0, 0)
  }

  function updateFrameThumbnail(frameIndex: number) {
    const canvas = frameCanvasRefs.value[frameIndex]
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.putImageData(frames.value[frameIndex], 0, 0)
    ctx.imageSmoothingEnabled = false
  }

  function initFrames() {
    const ctx = editorContext.value
    if (!ctx) return

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const imageData = ctx.createImageData(SPRITE_SIZE, SPRITE_SIZE)
      for (let j = 0; j < imageData.data.length; j += 4) {
        imageData.data[j + 3] = 0
      }
      frames.value.push(imageData)
    }
  }

  return {
    editorCanvasRef,
    previewCanvasRef,
    frameCanvasRefs,

    editorContext,
    previewContext,

    loadFrameToEditor,
    saveFrameFromEditor,
    updateFrameThumbnail,
    initFrames,
  }
}
