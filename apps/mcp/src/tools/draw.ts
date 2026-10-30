import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import {
  drawEllipse,
  drawLine,
  drawRect,
  fillArea,
  parseHexColor,
  setPixel
} from '@twirapp/dudes-sprite'

import { errorResult, textResult } from '../result.js'
import { requireDoc, type Session } from '../session.js'

export const layerSchema = z.enum([
  'body',
  'eyes',
  'mouth',
  'hat',
  'cosmetics'
])

export const frameSchema = z
  .number()
  .int()
  .min(0, 'frame must be 0..8')
  .max(8, 'frame must be 0..8')

export const coordSchema = (name: string) =>
  z
    .number()
    .int()
    .min(0, `${name} must be 0..31`)
    .max(31, `${name} must be 0..31`)

const sizeSchema = z.number().int().min(1).max(32)

export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)

const pixelArgs = {
  layer: layerSchema,
  frame: frameSchema,
  x: coordSchema('x'),
  y: coordSchema('y')
}

export function registerDrawTools(
  server: McpServer,
  session: Session
): void {
  server.registerTool(
    'set_pixel',
    {
      description:
        'Set one pixel. Coordinates are 0..31, (0,0) is top-left. The body layer must stay grayscale (R=G=B).',
      inputSchema: z.object({
        ...pixelArgs,
        color: colorSchema
      })
    },
    async ({ layer, frame, x, y, color }) => {
      try {
        const doc = requireDoc(session)
        setPixel(doc, layer, frame, x, y, parseHexColor(color))
        return textResult(`Painted ${layer} frame ${frame} at ${x},${y} with ${color}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'draw_line',
    {
      description:
        'Draw a 1px line including both endpoints. Coordinates are 0..31.',
      inputSchema: z.object({
        layer: layerSchema,
        frame: frameSchema,
        x0: coordSchema('x0'),
        y0: coordSchema('y0'),
        x1: coordSchema('x1'),
        y1: coordSchema('y1'),
        color: colorSchema
      })
    },
    async ({ layer, frame, x0, y0, x1, y1, color }) => {
      try {
        const doc = requireDoc(session)
        drawLine(
          doc,
          layer,
          frame,
          x0,
          y0,
          x1,
          y1,
          parseHexColor(color)
        )
        return textResult(`Line drawn on ${layer} frame ${frame}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'draw_rect',
    {
      description:
        'Draw a rectangle by top-left corner and size (max 32x32). filled=false draws only the border. Pixels past the canvas edge are clipped.',
      inputSchema: z.object({
        layer: layerSchema,
        frame: frameSchema,
        x: coordSchema('x'),
        y: coordSchema('y'),
        width: sizeSchema,
        height: sizeSchema,
        color: colorSchema,
        filled: z.boolean().default(true)
      })
    },
    async ({ layer, frame, x, y, width, height, color, filled }) => {
      try {
        const doc = requireDoc(session)
        drawRect(
          doc,
          layer,
          frame,
          x,
          y,
          width,
          height,
          parseHexColor(color),
          filled
        )
        return textResult(`Rectangle drawn on ${layer} frame ${frame}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'draw_ellipse',
    {
      description:
        'Draw an ellipse inside the given bounding box (max 32x32). filled=false draws only the outline. Pixels past the canvas edge are clipped.',
      inputSchema: z.object({
        layer: layerSchema,
        frame: frameSchema,
        x: coordSchema('x'),
        y: coordSchema('y'),
        width: sizeSchema,
        height: sizeSchema,
        color: colorSchema,
        filled: z.boolean().default(true)
      })
    },
    async ({ layer, frame, x, y, width, height, color, filled }) => {
      try {
        const doc = requireDoc(session)
        drawEllipse(
          doc,
          layer,
          frame,
          x,
          y,
          width,
          height,
          parseHexColor(color),
          filled
        )
        return textResult(`Ellipse drawn on ${layer} frame ${frame}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'fill_area',
    {
      description:
        'Flood-fill the connected area of the same color, starting at x,y (4-neighbour).',
      inputSchema: z.object({
        ...pixelArgs,
        color: colorSchema
      })
    },
    async ({ layer, frame, x, y, color }) => {
      try {
        const doc = requireDoc(session)
        fillArea(doc, layer, frame, x, y, parseHexColor(color))
        return textResult(`Filled ${layer} frame ${frame} from ${x},${y}`)
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'set_colors',
    {
      description:
        'Set tint colors for layers. The body color recolors the grayscale body; other layers are tinted too. Pixels are not changed.',
      inputSchema: z.object({
        body: colorSchema.optional(),
        eyes: colorSchema.optional(),
        mouth: colorSchema.optional(),
        hat: colorSchema.optional(),
        cosmetics: colorSchema.optional()
      })
    },
    async (colors) => {
      try {
        const doc = requireDoc(session)
        const entries = Object.entries(colors).filter(
          (entry): entry is [keyof typeof colors, string] =>
            typeof entry[1] === 'string'
        )

        for (const [layer, color] of entries) {
          parseHexColor(color)
          doc.colors[layer] = color
        }

        return textResult(
          `Colors: ${entries.map(([layer, color]) => `${layer}=${color}`).join(', ') || 'unchanged'}`
        )
      } catch (error) {
        return errorResult(error)
      }
    }
  )
}
