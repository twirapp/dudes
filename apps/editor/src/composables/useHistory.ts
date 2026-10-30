import { computed, ref, type ComputedRef } from 'vue'

import { cloneDocument } from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

const MAX_HISTORY = 50

export interface History {
  push: (current: SpriteDocument) => void
  undo: (current: SpriteDocument) => SpriteDocument | null
  redo: (current: SpriteDocument) => SpriteDocument | null
  reset: () => void
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
}

export function useHistory(_initial: SpriteDocument): History {
  const past: SpriteDocument[] = []
  const future: SpriteDocument[] = []
  const version = ref(0)

  const canUndo = computed(() => {
    version.value
    return past.length > 0
  })
  const canRedo = computed(() => {
    version.value
    return future.length > 0
  })

  function touch(): void {
    version.value++
  }

  function push(current: SpriteDocument): void {
    past.push(cloneDocument(current))
    if (past.length > MAX_HISTORY) past.shift()
    future.length = 0
    touch()
  }

  function undo(current: SpriteDocument): SpriteDocument | null {
    const previous = past.pop()
    if (!previous) return null
    future.push(cloneDocument(current))
    touch()
    return previous
  }

  function redo(current: SpriteDocument): SpriteDocument | null {
    const next = future.pop()
    if (!next) return null
    past.push(cloneDocument(current))
    touch()
    return next
  }

  function reset(): void {
    past.length = 0
    future.length = 0
    touch()
  }

  return { push, undo, redo, reset, canUndo, canRedo }
}
