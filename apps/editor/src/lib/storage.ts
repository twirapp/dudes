import { createStore, del, get, keys, set } from 'idb-keyval'

import type { SpriteDocument } from '@twirapp/dudes-sprite'

export interface ProjectMeta {
  id: string
  name: string
  updatedAt: number
}

export interface StoredProject extends ProjectMeta {
  doc: SpriteDocument
}

export interface ProjectStorage {
  save: (id: string, project: StoredProject) => Promise<void>
  load: (id: string) => Promise<StoredProject | undefined>
  list: () => Promise<ProjectMeta[]>
  remove: (id: string) => Promise<void>
}

const store = createStore('dudes-editor', 'projects')

export const idbStorage: ProjectStorage = {
  async save(id, project) {
    await set(id, project, store)
  },
  async load(id) {
    return get<StoredProject>(id, store)
  },
  async list() {
    const allKeys = (await keys(store)) as string[]
    const records = await Promise.all(
      allKeys.map((key) => get<StoredProject>(key, store))
    )
    return records
      .filter((record): record is StoredProject => Boolean(record))
      .map((record) => ({
        id: record.id,
        name: record.name,
        updatedAt: record.updatedAt
      }))
  },
  async remove(id) {
    await del(id, store)
  }
}

export function memoryStorage(): ProjectStorage {
  const records = new Map<string, StoredProject>()

  return {
    async save(id, project) {
      records.set(id, project)
    },
    async load(id) {
      return records.get(id)
    },
    async list() {
      return [...records.values()].map((record) => ({
        id: record.id,
        name: record.name,
        updatedAt: record.updatedAt
      }))
    },
    async remove(id) {
      records.delete(id)
    }
  }
}
