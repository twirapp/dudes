import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export function textResult(text: string): CallToolResult {
  return {
    content: [{ type: 'text', text }]
  }
}

export function errorResult(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error)
  return {
    content: [{ type: 'text', text: message }],
    isError: true
  }
}

export function imageResult(
  data: Uint8Array,
  text: string
): CallToolResult {
  return {
    content: [
      {
        type: 'image',
        data: Buffer.from(data).toString('base64'),
        mimeType: 'image/png'
      },
      { type: 'text', text }
    ]
  }
}
