import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { createSession } from './session.js'
import { registerDrawTools } from './tools/draw.js'
import { registerFrameTools } from './tools/frames.js'
import { registerGuideTool } from './tools/guide.js'
import { registerProjectTools } from './tools/project.js'
import { registerPreviewTools } from './tools/preview.js'
import { registerReadTools } from './tools/read.js'

export interface ServerOptions {
  workspace: string
}

export function createServer({ workspace }: ServerOptions): McpServer {
  const server = new McpServer({
    name: 'dudes-mcp',
    version: '0.0.0'
  })

  const session = createSession(workspace)

  registerGuideTool(server)
  registerProjectTools(server, session)
  registerDrawTools(server, session)
  registerFrameTools(server, session)
  registerReadTools(server, session)
  registerPreviewTools(server, session)

  return server
}
