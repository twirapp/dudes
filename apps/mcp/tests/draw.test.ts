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
  await call(client, 'create_project', { name: 'T' })
  return { client, workspace }
}

it('draws pixels and reports bounds errors', async () => {
  const { client, workspace } = await setup()

  const ok = await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 5,
    y: 6,
    color: '#ffffff'
  })
  expect(ok.isError).toBeFalsy()

  const bad = await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 32,
    y: 0,
    color: '#ffffff'
  })
  expect(bad.isError).toBe(true)
  expect(textOf(bad)).toMatch(/x must be 0\.\.31/)

  const badFrame = await call(client, 'set_pixel', {
    layer: 'body',
    frame: 9,
    x: 0,
    y: 0,
    color: '#ffffff'
  })
  expect(badFrame.isError).toBe(true)
  expect(textOf(badFrame)).toMatch(/frame must be 0\.\.8/)

  const saved = await call(client, 'save_project', { path: 'pixel' })
  expect(saved.isError).toBeFalsy()

  const doc = await readProjectDir(join(workspace, 'pixel'))
  expect(getPixel(doc, 'body', 0, 5, 6)).toBe(0xffffffff)
})

it('draws primitives into the requested frame and layer', async () => {
  const { client, workspace } = await setup()

  await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 0,
    y: 0,
    color: '#ffffff'
  })
  await call(client, 'draw_rect', {
    layer: 'eyes',
    frame: 3,
    x: 2,
    y: 2,
    width: 4,
    height: 4,
    color: '#ff0000'
  })
  await call(client, 'draw_line', {
    layer: 'eyes',
    frame: 3,
    x0: 0,
    y0: 0,
    x1: 3,
    y1: 0,
    color: '#00ff00'
  })
  await call(client, 'draw_ellipse', {
    layer: 'eyes',
    frame: 3,
    x: 8,
    y: 8,
    width: 6,
    height: 6,
    color: '#0000ff'
  })
  await call(client, 'fill_area', {
    layer: 'eyes',
    frame: 4,
    x: 0,
    y: 0,
    color: '#123456'
  })

  const saved = await call(client, 'save_project', { path: 'primitives' })
  expect(saved.isError).toBeFalsy()

  const doc = await readProjectDir(join(workspace, 'primitives'))
  expect(getPixel(doc, 'eyes', 3, 2, 2)).toBe(0xff0000ff)
  expect(getPixel(doc, 'eyes', 3, 3, 0)).toBe(0x00ff00ff)
  expect(getPixel(doc, 'eyes', 3, 10, 10)).toBe(0x0000ffff)
  expect(getPixel(doc, 'eyes', 3, 7, 7)).toBe(0)
  expect(getPixel(doc, 'eyes', 4, 31, 31)).toBe(0x123456ff)
})

it('returns a compact pixel map', async () => {
  const { client } = await setup()

  const result = await call(client, 'get_pixels', {
    layer: 'body',
    frame: 0
  })
  const payload = JSON.parse(textOf(result))

  expect(payload.rows).toHaveLength(32)
  expect(payload.rows[0]).toHaveLength(32)
  expect(payload.legend[payload.rows[0][0]]).toBe('#00000000')
})

it('sets colors without touching pixels', async () => {
  const { client, workspace } = await setup()

  await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 1,
    y: 1,
    color: '#ffffff'
  })
  const result = await call(client, 'set_colors', { body: '#112233' })
  expect(result.isError).toBeFalsy()

  await call(client, 'save_project', { path: 'colors' })
  const doc = await readProjectDir(join(workspace, 'colors'))
  expect(doc.colors.body).toBe('#112233')
  expect(getPixel(doc, 'body', 0, 1, 1)).toBe(0xffffffff)
})
