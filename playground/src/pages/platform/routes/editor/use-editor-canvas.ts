import { computed, shallowRef } from 'vue'
import { SPRITE_SIZE, TOTAL_FRAMES } from './editor-constants'
import { useEditor } from './use-editor'

const editorCanvasRef = shallowRef<HTMLCanvasElement>()
const frameCanvasRefs = shallowRef<HTMLCanvasElement[]>([])
const editorPreviewCanvasRef = shallowRef<HTMLCanvasElement>()

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

  const editorPreviewContext = computed(() => {
    const ctx = editorPreviewCanvasRef.value?.getContext('2d')
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

  // function initFrames() {
  //   const ctx = editorContext.value
  //   if (!ctx) return
  //   for (let i = 0; i < TOTAL_FRAMES; i++) {
  //     const imageData = ctx.createImageData(SPRITE_SIZE, SPRITE_SIZE)
  //     for (let j = 0; j < imageData.data.length; j += 4) {
  //       imageData.data[j + 3] = 0
  //     }
  //     frames.value.push(imageData)
  //   }
  // }

  function loadSprite(fileUrl: string) {
    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.src = fileUrl
      img.onerror = reject
      img.onload = () => {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        const ctx = tempCanvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        ctx.drawImage(img, 0, 0)

        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const frameData = ctx.getImageData(
            i * SPRITE_SIZE,
            0,
            SPRITE_SIZE,
            SPRITE_SIZE,
          )
          frames.value[i] = frameData
          updateFrameThumbnail(i)
        }

        loadFrameToEditor()
        tempCanvas.remove()
        img.remove()
        resolve()
      }
    })
  }

  return {
    editorCanvasRef,
    editorPreviewCanvasRef,
    frameCanvasRefs,

    editorContext,
    editorPreviewContext,

    loadFrameToEditor,
    saveFrameFromEditor,
    updateFrameThumbnail,
    loadSprite,
  }
}
