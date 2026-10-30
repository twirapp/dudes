import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import {
  buildPackage,
  getPixel,
  readPackage,
  validateDocument
} from '@twirapp/dudes-sprite'

import { readProjectDir } from '../src/workspace.js'
import { call, connect } from './helpers.js'

it('draws a whole dude with tools and reopens it in the editor pipeline', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dudes-mcp-'))
  const { client } = await connect(workspace)

  await call(client, 'create_project', { name: 'E2E' })
  await call(client, 'draw_rect', {
    layer: 'body',
    frame: 0,
    x: 8,
    y: 8,
    width: 16,
    height: 16,
    color: '#ffffff'
  })

  for (let frame = 1; frame < 9; frame++) {
    await call(client, 'copy_frame', { from: frame - 1, to: frame })
  }

  await call(client, 'set_pixel', {
    layer: 'eyes',
    frame: 0,
    x: 14,
    y: 13,
    color: '#201533'
  })
  await call(client, 'set_pixel', {
    layer: 'eyes',
    frame: 0,
    x: 17,
    y: 13,
    color: '#201533'
  })
  await call(client, 'set_colors', { body: '#e6ac0c' })

  const saved = await call(client, 'save_project', { path: 'e2e' })
  expect(saved.isError).toBeFalsy()

  const doc = await readProjectDir(join(workspace, 'e2e'))
  expect(
    validateDocument(doc).filter((issue) => issue.severity === 'error')
  ).toEqual([])

  const reopened = readPackage(buildPackage(doc))
  expect(getPixel(reopened, 'body', 0, 10, 10)).toBe(0xffffffff)
  expect(getPixel(reopened, 'eyes', 0, 14, 13)).toBe(0x201533ff)
  expect(reopened.colors.body).toBe('#e6ac0c')
})
