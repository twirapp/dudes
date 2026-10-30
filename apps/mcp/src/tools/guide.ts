import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { textResult } from '../result.js'
import { GUIDE } from '../summary.js'

export function registerGuideTool(server: McpServer): void {
  server.registerTool(
    'get_guide',
    {
      description:
        'Read the dudes format guide: canvas size, frame order, layer order, grayscale body rule, alpha rules and drawing tips. Call this before drawing.',
      inputSchema: z.object({})
    },
    async () => textResult(GUIDE)
  )
}
