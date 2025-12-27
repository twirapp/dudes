import type { DudesFrameTag } from '@twirapp/dudes-vue'
import type { InjectionKey, Ref } from 'vue'
import type { AnimationRange, EditorTool } from './editor-constants'

export interface EditorContext {
  tool: Ref<EditorTool>
  fps: Ref<number>
  colorLeft: Ref<string>
  colorRight: Ref<string>
  drawingKey: Ref<number>
  isPlaying: Ref<boolean>
  isDrawing: Ref<boolean>

  frames: Ref<ImageData[]>
  currentAnimation: Ref<DudesFrameTag>
  currentFrameIndex: Ref<number>
  currentRange: Ref<AnimationRange>
}

export const editorInjectionKey: InjectionKey<EditorContext> = Symbol('editor')
