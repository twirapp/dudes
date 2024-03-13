export class RequestAnimationFrame {
  private maxFps = 60
  private minElapsedMS = 1000 / this.maxFps
  private maxElapsedMS = 100
  private lastTime = performance.now()
  private lastFrame = -1
  private rafId: number | null = null

  constructor(private callback: () => void) {
    this.render = this.render.bind(this)
  }

  private render(currentTime = performance.now()): void {
    let elapsedMS = currentTime - this.lastTime

    if (elapsedMS > this.maxElapsedMS) {
      elapsedMS = this.maxElapsedMS
    }

    const delta = (currentTime - this.lastFrame) | 0

    if (delta > this.minElapsedMS) {
      this.lastFrame = currentTime - (delta % this.minElapsedMS)
      this.lastTime = currentTime
      this.callback()
    }

    this.rafId = requestAnimationFrame(this.render)
  }

  start(): void {
    this.stop()
    this.render()
  }

  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }
}
