import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { formatHexColor, getPixel, FRAME_SIZE, LAYERS } from '@twirapp/dudes-sprite'

import { errorResult, textResult } from '../result.js'
import { requireDoc, type Session } from '../session.js'
import { frameSchema, layerSchema } from './draw.js'

const POOL =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function registerReadTools(
  server: McpServer,
  session: Session
): void {
  server.registerTool(
    'get_pixels',
    {
      description:
        'Read a frame of one layer as a compact pixel map. Returns a legend (character -> #RRGGBBAA) and 32 rows of 32 characters. Transparent is always the first legend entry (#00000000).',
      inputSchema: z.object({
        layer: layerSchema,
        frame: frameSchema
      })
    },
    async ({ layer, frame }) => {
      try {
        const doc = requireDoc(session)
        const legend: Record<string, string> = { '0': '#00000000' }
        const palette = new Map<string, string>([['#00000000', '0']])

        const rows: string[] = []
        for (let y = 0; y < FRAME_SIZE; y++) {
          let row = ''
          for (let x = 0; x < FRAME_SIZE; x++) {
            const hex = formatHexColor(getPixel(doc, layer, frame, x, y))
            let char = palette.get(hex)
            if (!char) {
              char = POOL[palette.size]
              if (!char) {
                throw new Error('Too many unique colors in this frame (max 62)')
              }
              palette.set(hex, char)
              legend[char] = hex
            }
            row += char
          }
          rows.push(row)
        }

        return textResult(
          JSON.stringify({ layer, frame, legend, rows })
        )
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'list_layers',
    {
      description:
        'List the layer names in composite order. Use these names in all drawing tools.',
      inputSchema: z.object({})
    },
    async () => textResult(LAYERS.join(', '))
  )
}
