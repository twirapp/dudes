import { ROUND } from '../constants.js'

export const useRaf = (callback: () => void) => {
  let lastTime = performance.now()
  let lastFrame = -1

  const maxFps = 60
  const minElapsedMS = ROUND / maxFps
  const maxElapsedMS = 100

  function startRaf(currentTime = performance.now()): void {
    let elapsedMS = currentTime - lastTime

    if (elapsedMS > maxElapsedMS) {
      elapsedMS = maxElapsedMS
    }

    const delta = (currentTime - lastFrame) | 0

    if (delta > minElapsedMS) {
      lastFrame = currentTime - (delta % minElapsedMS)
      lastTime = currentTime
      callback()
    }

    requestAnimationFrame(startRaf)
  }

  return {
    startRaf
  }
}
