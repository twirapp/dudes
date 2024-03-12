import { Renderer } from 'pixi.js'
import { ref } from 'vue'
import type { Ref } from 'vue'

const renderer = ref<Renderer | null>(null)

type UseRenderer = {
  renderer: Ref<Renderer | null>
  initRenderer: (canvasRef: Ref<HTMLCanvasElement | null>) => void
}

export const useRenderer = () => {
  function initRenderer(canvasRef: Ref<HTMLCanvasElement | null>) {
    if (!canvasRef.value || renderer.value) return

    renderer.value = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      view: canvasRef.value,
      antialias: true
    })
  }

  return {
    renderer,
    initRenderer
  } as UseRenderer
}
