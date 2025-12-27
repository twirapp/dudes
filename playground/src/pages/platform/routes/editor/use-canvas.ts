import { computed, shallowRef } from 'vue'

export function useCanvas() {
  const canvasRef = shallowRef<HTMLCanvasElement>()

  const ctx = computed(() => {
    const ctx = canvasRef.value?.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    return ctx
  })

  return {
    canvasRef,
    ctx,
  }
}
