import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { createDocument, getPixel, setPixel } from '@twirapp/dudes-sprite'

import { useProjects } from '../src/composables/useProjects.js'
import { memoryStorage } from '../src/lib/storage.js'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

it('creates, saves and reopens a project', async () => {
  const projects = useProjects(memoryStorage())
  const doc = createDocument('Twir')
  setPixel(doc, 'body', 0, 1, 1, 0xffffffff)

  await projects.create('Twir', doc)
  projects.scheduleAutosave(doc)
  await vi.advanceTimersByTimeAsync(1100)

  expect(projects.projects.value).toHaveLength(1)
  expect(projects.projects.value[0].name).toBe('Twir')

  const loaded = await projects.open(projects.currentId.value!)
  expect(loaded?.name).toBe('Twir')
  expect(getPixel(loaded!, 'body', 0, 1, 1)).not.toBe(0)
})

it('debounces autosave into one write', async () => {
  const storage = memoryStorage()
  const projects = useProjects(storage)
  await projects.create('A')
  const spy = vi.spyOn(storage, 'save')

  const doc = createDocument('A')
  projects.scheduleAutosave(doc)
  projects.scheduleAutosave(doc)
  projects.scheduleAutosave(doc)
  await vi.advanceTimersByTimeAsync(1100)

  expect(spy).toHaveBeenCalledTimes(1)
})

it('removes a project', async () => {
  const projects = useProjects(memoryStorage())
  await projects.create('A')
  await projects.remove(projects.currentId.value!)

  expect(projects.currentId.value).toBeNull()
  expect(projects.projects.value).toHaveLength(0)
})

it('flushes pending changes before switching projects', async () => {
  const storage = memoryStorage()
  const projects = useProjects(storage)
  const doc = createDocument('A')
  await projects.create('A', doc)

  const edited = createDocument('A')
  setPixel(edited, 'body', 0, 2, 2, 0xffffffff)
  projects.scheduleAutosave(edited)
  expect(await projects.flush(edited)).toBe(true)

  const loaded = await projects.open(projects.currentId.value!)
  expect(loaded && getPixel(loaded, 'body', 0, 2, 2)).toBe(0xffffffff)

  const spy = vi.spyOn(storage, 'save')
  await vi.advanceTimersByTimeAsync(1200)
  expect(spy).not.toHaveBeenCalled()
})

it('reports storage failures without corrupting the open project', async () => {
  const storage = memoryStorage()
  const projects = useProjects(storage)
  const doc = createDocument('A')
  await projects.create('A', doc)
  const previousId = projects.currentId.value

  const spy = vi
    .spyOn(storage, 'save')
    .mockRejectedValue(new Error('quota exceeded'))

  expect(await projects.flush(createDocument('A'))).toBe(false)
  expect(spy).toHaveBeenCalled()
  expect(projects.currentId.value).toBe(previousId)
  expect(projects.error.value).toMatch(/quota exceeded/)

  expect(await projects.create('B')).toBe(false)
  expect(projects.currentId.value).toBe(previousId)
  expect(projects.error.value).toMatch(/quota exceeded/)
})
