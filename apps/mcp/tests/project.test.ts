import { access, mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import {
  createDocument,
  emptyStrip,
  getPixel,
  setPixel
} from '@twirapp/dudes-sprite'

import {
  readProjectDir,
  resolveProjectDir,
  writeProjectDir
} from '../src/workspace.js'
import { call, connect, textOf } from './helpers.js'

async function makeWorkspace(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'dudes-mcp-'))
}

it('lists the project tools', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)
  const names = (await client.listTools()).tools.map((tool) => tool.name)

  expect(names).toEqual(
    expect.arrayContaining([
      'create_project',
      'open_project',
      'save_project',
      'get_project',
      'get_guide'
    ])
  )
})

it('writes and reads a project folder', async () => {
  const workspace = await makeWorkspace()
  const doc = createDocument('Twir')
  setPixel(doc, 'body', 0, 1, 1, 0xffffffff)

  const files = await writeProjectDir(join(workspace, 'twir'), doc)
  expect(files).toEqual(
    expect.arrayContaining([
      'body.png',
      'eyes.png',
      'mouth.png',
      'hat.png',
      'cosmetics.png',
      'dude.json',
      'preview.png'
    ])
  )

  const restored = await readProjectDir(join(workspace, 'twir'))
  expect(restored.name).toBe('Twir')
  expect(getPixel(restored, 'body', 0, 1, 1)).toBe(0xffffffff)
})

it('creates a project through the tool', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)

  const created = await call(client, 'create_project', { name: 'Opened' })
  expect(created.isError).toBeFalsy()
  expect(textOf(created)).toContain('Opened')

  const described = await call(client, 'get_project')
  expect(textOf(described)).toContain('body: empty')
})

it('refuses paths outside the workspace', () => {
  expect(() => resolveProjectDir('/tmp/ws', '../escape')).toThrow(
    /outside workspace/
  )
  expect(() => resolveProjectDir('/tmp/ws', '/etc')).toThrow(
    /outside workspace/
  )
  expect(() => resolveProjectDir('/tmp/ws', '')).toThrow(/required/)
})

it('blocks saving a document with validation errors', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)

  await call(client, 'create_project', { name: 'Bad' })
  const saved = await call(client, 'save_project', { path: 'bad' })

  expect(saved.isError).toBe(true)
  expect(textOf(saved)).toMatch(/body layer is empty/i)
  await expect(access(join(workspace, 'bad'))).rejects.toThrow()
})

it('saves and opens a valid project through tools', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)

  await call(client, 'create_project', { name: 'Good' })
  const doc = createDocument('Good')
  setPixel(doc, 'body', 0, 1, 1, 0xffffffff)
  await writeProjectDir(join(workspace, 'seed'), doc)

  const opened = await call(client, 'open_project', { path: 'seed' })
  expect(opened.isError).toBeFalsy()

  const saved = await call(client, 'save_project', { path: 'good' })
  expect(saved.isError).toBeFalsy()
  const files = await readdir(join(workspace, 'good'))
  expect(files).toContain('dude.json')
})

it('reuses the opened folder when saving without a path', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)

  const doc = createDocument('Reused')
  setPixel(doc, 'body', 0, 2, 2, 0xffffffff)
  await writeProjectDir(join(workspace, 'reused'), doc)

  await call(client, 'open_project', { path: 'reused' })
  const saved = await call(client, 'save_project')

  expect(saved.isError).toBeFalsy()
  const files = await readdir(join(workspace, 'reused'))
  expect(files).toContain('dude.json')
})

it('slugifies the project name when saving without a path', async () => {
  const workspace = await makeWorkspace()
  const { client } = await connect(workspace)

  await call(client, 'create_project', { name: 'Slug Dude' })
  await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 1,
    y: 1,
    color: '#ffffff'
  })
  const saved = await call(client, 'save_project')

  expect(saved.isError).toBeFalsy()
  const files = await readdir(join(workspace, 'slug-dude'))
  expect(files).toContain('body.png')
})

it('rejects manifest file names that escape the project folder', async () => {
  const workspace = await makeWorkspace()
  const dir = join(workspace, 'escape')
  await mkdir(dir, { recursive: true })
  await writeFile(
    join(dir, 'dude.json'),
    JSON.stringify({
      version: 1,
      name: 'Escape',
      layers: { body: '../../outside.png' },
      colors: {}
    })
  )
  await writeFile(join(dir, 'body.png'), emptyStrip())

  await expect(readProjectDir(dir)).rejects.toThrow(
    /Invalid layer file name/
  )
})
