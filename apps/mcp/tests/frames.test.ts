import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import { getPixel } from '@twirapp/dudes-sprite'

import { readProjectDir } from '../src/workspace.js'
import { call, connect, textOf } from './helpers.js'

async function setup() {
  const workspace = await mkdtemp(join(tmpdir(), 'dudes-mcp-'))
  const { client } = await connect(workspace)
  await call(client, 'create_project', { name: 'Frames' })

  await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 0,
    y: 0,
    color: '#ffffff'
  })
  await call(client, 'set_pixel', {
    layer: 'hat',
    frame: 0,
    x: 0,
    y: 0,
    color: '#ffffff'
  })

  return { client, workspace }
}

it('copies, shifts, mirrors and clears frames', async () => {
  const { client, workspace } = await setup()

  await call(client, 'copy_frame', { from: 0, to: 1 })
  await call(client, 'shift_frame', { frame: 1, dx: 1, dy: 0 })
  await call(client, 'mirror_frame', { frame: 1, axis: 'horizontal' })
  await call(client, 'clear_frame', { frame: 0, layer: 'hat' })

  await call(client, 'save_project', { path: 'frames' })
  const doc = await readProjectDir(join(workspace, 'frames'))

  expect(getPixel(doc, 'hat', 0, 0, 0)).toBe(0)
  expect(getPixel(doc, 'hat', 1, 30, 0)).toBe(0xffffffff)
  expect(getPixel(doc, 'body', 1, 30, 0)).toBe(0xffffffff)
})

it('reports invalid frame indices', async () => {
  const { client } = await setup()

  const result = await call(client, 'copy_frame', { from: 0, to: 12 })
  expect(result.isError).toBe(true)
})

it('rejects out-of-bounds primitives instead of hanging', async () => {
  const { client } = await setup()

  const line = await call(client, 'draw_line', {
    layer: 'body',
    frame: 0,
    x0: 0,
    y0: 0,
    x1: 32,
    y1: 0,
    color: '#ffffff'
  })
  expect(line.isError).toBe(true)
  expect(textOf(line)).toMatch(/x1 must be 0\.\.31/)

  const fill = await call(client, 'fill_area', {
    layer: 'body',
    frame: 0,
    x: -1,
    y: 0,
    color: '#ffffff'
  })
  expect(fill.isError).toBe(true)

  const huge = await call(client, 'draw_rect', {
    layer: 'body',
    frame: 0,
    x: 0,
    y: 0,
    width: 100000,
    height: 100000,
    color: '#ffffff'
  })
  expect(huge.isError).toBe(true)
})

it('advertises coordinate bounds in the tool schema', async () => {
  const { client } = await setup()
  const tools = (await client.listTools()).tools
  const setPixel = tools.find((tool) => tool.name === 'set_pixel')
  const properties = setPixel?.inputSchema.properties as Record<
    string,
    { minimum?: number; maximum?: number }
  >

  expect(properties.x.minimum).toBe(0)
  expect(properties.x.maximum).toBe(31)
  expect(properties.y.minimum).toBe(0)
  expect(properties.y.maximum).toBe(31)
})
