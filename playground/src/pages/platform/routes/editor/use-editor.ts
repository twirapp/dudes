import { injectLocal, provideLocal } from '@vueuse/core'
import { computed } from 'vue'
import { ANIMATION_RANGES } from './editor-constants'
import { editorInjectionKey } from './editor-injection-key'
import type { EditorContext } from './editor-injection-key'

export function useEditor() {
  return injectLocal(editorInjectionKey)!
}

export function provideEditor(ctx: Omit<EditorContext, 'currentRange'>) {
  const currentRange = computed(() => {
    return ANIMATION_RANGES[ctx.currentAnimation.value]
  })

  provideLocal(editorInjectionKey, {
    ...ctx,
    currentRange,
  })
}
