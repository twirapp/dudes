import { computed, onUnmounted, shallowRef } from 'vue'
import { SPRITE_SIZE } from '../editor-constants'
import { useEditor } from '../use-editor'

const previewCanvasRef = shallowRef<HTMLCanvasElement>()

export function useAnimationPreview() {
  const {
    fps,
    frames,
    isPlaying,
    currentRange,
  } = useEditor()

  const previewContext = computed(() => {
    const ctx = previewCanvasRef.value?.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    return ctx
  })

  let previewAnimationId: number | null = null
  let lastFrameTime = 0
  let previewFrameIndex = 0

  function animatePreview(timestamp: number) {
    const fpsInterval = 1000 / fps.value
    const elapsed = timestamp - lastFrameTime

    if (elapsed > fpsInterval) {
      lastFrameTime = timestamp - (elapsed % fpsInterval)

      const range = currentRange.value
      const frameCount = range.to - range.from + 1

      const ctx = previewContext.value
      if (ctx) {
        ctx.clearRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
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

  onUnmounted(() => {
    if (previewAnimationId !== null) {
      cancelAnimationFrame(previewAnimationId)
    }
  })

  return {
    previewCanvasRef,
    previewContext,

    isPlaying,
    fps,
    togglePreview,
  }
}
