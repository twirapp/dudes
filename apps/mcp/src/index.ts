import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createServer } from './server.js'

const workspace = process.env.DUDES_WORKSPACE ?? process.cwd()
const server = createServer({ workspace })

await server.connect(new StdioServerTransport())
