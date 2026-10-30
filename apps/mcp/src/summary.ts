import {
  FRAME_COUNT,
  LAYERS,
  validateDocument
} from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

export function describeDocument(doc: SpriteDocument): string {
  const lines: string[] = [`Project: ${doc.name}`]

  lines.push(
    `Colors: ${LAYERS.map((layer) => `${layer}=${doc.colors[layer]}`).join(', ')}`
  )

  for (const layer of LAYERS) {
    const filled: number[] = []
    for (let frame = 0; frame < FRAME_COUNT; frame++) {
      const data = doc.layers[layer][frame]
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] > 0) {
          filled.push(frame)
          break
        }
      }
    }

    lines.push(
      filled.length > 0
        ? `${layer}: frames ${filled.join(', ')} filled (${filled.length}/${FRAME_COUNT})`
        : `${layer}: empty`
    )
  }

  const issues = validateDocument(doc)
  lines.push(
    issues.length === 0
      ? 'Issues: none'
      : `Issues: ${issues
          .map((issue) => `${issue.severity} ${issue.code} — ${issue.message}`)
          .join('; ')}`
  )

  return lines.join('\n')
}

export const GUIDE = `# Dudes sprite guide

You are drawing 32x32 pixel-art dudes for the Twir stream bot.

## Format
- 9 frames per layer, 5 layers: body, eyes, mouth, hat, cosmetics.
- Frame order is fixed: idle 0-2 (300ms each), jump 3, fall 4, land 5, run 6-8 (100ms each).
- Canvas coordinates are 0..31; (0,0) is the top-left pixel.
- Layers are composited bottom-up: body, eyes, mouth, hat, cosmetics.

## Rules that affect the bot
- The BODY layer is recolored in the bot via tint. Draw the body only in grayscale
  (R=G=B): white, black, and gray shades. A colored body is rejected as an error.
- Other layers may use any colors; they are tinted white by default.
- Use binary alpha (fully opaque or fully transparent). Partial alpha is a warning.
- Every dude needs at least one body pixel. Optional layers may stay empty.

## Drawing tips
- Draw the base pose on frame 0, then use copy_frame to create later frames and
  shift/mirror pixels instead of redrawing everything.
- Keep silhouettes readable at 32x32: few colors, clear outline.
- Call render_preview after each significant change to see the contact sheet, and
  validate before saving.
- save_project writes PNG strips, dude.json and preview.png into the workspace.
`
