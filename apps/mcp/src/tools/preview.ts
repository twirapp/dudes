import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import {
  renderFramePng,
  renderPreviewPng,
  validateDocument
} from '@twirapp/dudes-sprite'

import { errorResult, imageResult, textResult } from '../result.js'
import { requireDoc, type Session } from '../session.js'

export function registerPreviewTools(
  server: McpServer,
  session: Session
): void {
  server.registerTool(
    'render_preview',
    {
      description:
        'Render the current project as a PNG image for visual inspection. Without frame, returns a 3x3 contact sheet of all 9 frames (left-to-right, top-to-bottom: idle 0-2, jump 3, fall 4, land 5, run 6-8) on a checkerboard. With frame, returns that single frame. Call this after changes and iterate on what you see.',
      inputSchema: z.object({
        scale: z.number().int().min(1).max(8).default(4),
        frame: z
          .number()
          .int()
          .min(0, 'frame must be 0..8')
          .max(8, 'frame must be 0..8')
          .optional()
      })
    },
    async ({ scale, frame }) => {
      try {
        const doc = requireDoc(session)

        if (frame !== undefined) {
          const png = renderFramePng(doc, frame, { scale })
          return imageResult(png, `Frame ${frame} of ${doc.name} at ${scale}x`)
        }

        const png = renderPreviewPng(doc, { scale })
        return imageResult(
          png,
          `Contact sheet of ${doc.name} at ${scale}x. Order: idle 0, idle 1, idle 2, jump 3, fall 4, land 5, run 6, run 7, run 8.`
        )
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'validate',
    {
      description:
        'Validate the current project: empty body, colored body (must be grayscale for tinting), partially transparent pixels. Returns a JSON array of issues.',
      inputSchema: z.object({})
    },
    async () => {
      try {
        const doc = requireDoc(session)
        const issues = validateDocument(doc)
        return textResult(JSON.stringify(issues, null, 2))
      } catch (error) {
        return errorResult(error)
      }
    }
  )
}
