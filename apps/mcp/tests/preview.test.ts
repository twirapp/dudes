import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import { decodePng } from '@twirapp/dudes-sprite'

import { call, connect, textOf } from './helpers.js'

async function setup() {
  const workspace = await mkdtemp(join(tmpdir(), 'dudes-mcp-'))
  const { client } = await connect(workspace)
  await call(client, 'create_project', { name: 'Preview' })
  await call(client, 'set_pixel', {
    layer: 'body',
    frame: 0,
    x: 4,
    y: 4,
    color: '#ffffff'
  })
  return { client }
}

function imageOf(result: { content: { type: string }[] }) {
  return result.content.find(
    (item): item is { type: 'image'; data: string; mimeType: string } =>
      item.type === 'image'
  )
}

it('returns an image content block for the contact sheet', async () => {
  const { client } = await setup()

  const result = await call(client, 'render_preview')
  const image = imageOf(result as never)

  expect(image?.mimeType).toBe('image/png')
  const decoded = decodePng(
    new Uint8Array(Buffer.from(image!.data, 'base64'))
  )
  expect([decoded.width, decoded.height]).toEqual([384, 384])
})

it('renders a single frame when asked', async () => {
  const { client } = await setup()

  const result = await call(client, 'render_preview', {
    frame: 3,
    scale: 8
  })
  const image = imageOf(result as never)
  const decoded = decodePng(
    new Uint8Array(Buffer.from(image!.data, 'base64'))
  )
  expect([decoded.width, decoded.height]).toEqual([256, 256])
})

it('returns validation issues as JSON', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'dudes-mcp-'))
  const { client } = await connect(workspace)
  await call(client, 'create_project', { name: 'Empty' })

  const result = await call(client, 'validate')
  const issues = JSON.parse(textOf(result))

  expect(issues).toContainEqual(
    expect.objectContaining({ code: 'body-empty' })
  )
})

it('advertises the frame bounds on render_preview', async () => {
  const { client } = await setup()
  const tools = (await client.listTools()).tools
  const preview = tools.find((tool) => tool.name === 'render_preview')
  const properties = preview?.inputSchema.properties as Record<
    string,
    { minimum?: number; maximum?: number }
  >

  expect(properties.frame.minimum).toBe(0)
  expect(properties.frame.maximum).toBe(8)
})
