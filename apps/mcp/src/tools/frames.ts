import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import {
  clearFrame,
  copyFrame,
  mirrorFrame,
  shiftFrame
} from '@twirapp/dudes-sprite'

import { errorResult, textResult } from '../result.js'
import { requireDoc, type Session } from '../session.js'
import { frameSchema, layerSchema } from './draw.js'

export function registerFrameTools(
  server: McpServer,
  session: Session
): void {
  server.registerTool(
    'copy_frame',
    {
      description:
        'Copy all layers from one frame to another. Useful to derive idle/run frames from a key pose before shifting pixels.',
      inputSchema: z.object({
        from: frameSchema,
        to: frameSchema
      })
    },
    async ({ from, to }) => {
      try {
        const doc = requireDoc(session)
        copyFrame(doc, from, to)
        return textResult(`Copied frame ${from} to ${to}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'shift_frame',
    {
      description:
        'Move all pixels of a frame by dx,dy. Pixels leaving the canvas are discarded; vacated pixels become transparent.',
      inputSchema: z.object({
        frame: frameSchema,
        dx: z.number().int(),
        dy: z.number().int()
      })
    },
    async ({ frame, dx, dy }) => {
      try {
        const doc = requireDoc(session)
        shiftFrame(doc, frame, dx, dy)
        return textResult(`Shifted frame ${frame} by ${dx},${dy}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'mirror_frame',
    {
      description:
        'Flip all pixels of a frame horizontally (left/right) or vertically (top/bottom).',
      inputSchema: z.object({
        frame: frameSchema,
        axis: z.enum(['horizontal', 'vertical'])
      })
    },
    async ({ frame, axis }) => {
      try {
        const doc = requireDoc(session)
        mirrorFrame(doc, frame, axis)
        return textResult(`Mirrored frame ${frame} ${axis}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'clear_frame',
    {
      description:
        'Clear one layer of a frame, or the whole frame when layer is omitted.',
      inputSchema: z.object({
        frame: frameSchema,
        layer: layerSchema.optional()
      })
    },
    async ({ frame, layer }) => {
      try {
        const doc = requireDoc(session)
        clearFrame(doc, frame, layer)
        return textResult(
          layer ? `Cleared ${layer} on frame ${frame}` : `Cleared frame ${frame}`
        )
      } catch (error) {
        return errorResult(error)
      }
    }
  )
}
