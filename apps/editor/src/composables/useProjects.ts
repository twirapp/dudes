import { ref } from 'vue'

import { createDocument } from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

import type {
  ProjectMeta,
  ProjectStorage,
  StoredProject
} from '../lib/storage.js'

const AUTOSAVE_DELAY = 1000

export function useProjects(storage: ProjectStorage) {
  const projects = ref<ProjectMeta[]>([])
  const currentId = ref<string | null>(null)
  const error = ref<string | null>(null)

  let timer: ReturnType<typeof setTimeout> | null = null
  let pending: SpriteDocument | null = null

  function capture(cause: unknown): void {
    error.value = cause instanceof Error ? cause.message : String(cause)
  }

  function clearError(): void {
    error.value = null
  }

  async function refresh(): Promise<void> {
    try {
      const list = await storage.list()
      projects.value = list.sort((a, b) => b.updatedAt - a.updatedAt)
    } catch (cause) {
      capture(cause)
    }
  }

  async function create(
    name: string,
    doc: SpriteDocument = createDocument(name)
  ): Promise<boolean> {
    const previousId = currentId.value

    try {
      const id = crypto.randomUUID()
      const record: StoredProject = {
        id,
        name: doc.name || name,
        updatedAt: Date.now(),
        doc
      }
      await storage.save(id, record)
      currentId.value = id
      clearError()
      await refresh()
      return true
    } catch (cause) {
      capture(cause)
      currentId.value = previousId
      return false
    }
  }

  async function open(id: string): Promise<SpriteDocument | undefined> {
    try {
      const record = await storage.load(id)
      if (!record) return undefined
      currentId.value = id
      return record.doc
    } catch (cause) {
      capture(cause)
      return undefined
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await storage.remove(id)
      if (currentId.value === id) currentId.value = null
      await refresh()
    } catch (cause) {
      capture(cause)
    }
  }

  async function saveNow(doc: SpriteDocument): Promise<boolean> {
    if (!currentId.value) return true

    try {
      await storage.save(currentId.value, {
        id: currentId.value,
        name: doc.name,
        updatedAt: Date.now(),
        doc
      })
      clearError()
      await refresh()
      return true
    } catch (cause) {
      capture(cause)
      return false
    }
  }

  function scheduleAutosave(doc: SpriteDocument): void {
    pending = doc
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (pending) void saveNow(pending)
    }, AUTOSAVE_DELAY)
  }

  function cancelAutosave(): void {
    if (timer) clearTimeout(timer)
    timer = null
    pending = null
  }

  /** Write pending changes immediately before switching projects. */
  async function flush(doc: SpriteDocument): Promise<boolean> {
    cancelAutosave()
    return saveNow(doc)
  }

  return {
    projects,
    currentId,
    error,
    clearError,
    create,
    open,
    remove,
    refresh,
    saveNow,
    scheduleAutosave,
    cancelAutosave,
    flush
  }
}

export type Projects = ReturnType<typeof useProjects>
