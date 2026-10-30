import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { createServer } from '../src/server.js'

export async function connect(workspace: string) {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()
  const server = createServer({ workspace })
  const client = new Client({ name: 'test', version: '1.0.0' })

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport)
  ])

  return { client, server }
}

export function textOf(result: CallToolResult): string {
  const block = result.content.find((item) => item.type === 'text')
  return block && block.type === 'text' ? block.text : ''
}

export async function call(
  client: Client,
  name: string,
  args: Record<string, unknown> = {}
): Promise<CallToolResult> {
  return client.callTool({ name, arguments: args })
}
