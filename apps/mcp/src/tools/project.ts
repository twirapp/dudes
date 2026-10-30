import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

import { validateDocument } from '@twirapp/dudes-sprite'

import { errorResult, textResult } from '../result.js'
import { newDocument, requireDoc, type Session } from '../session.js'
import { describeDocument } from '../summary.js'
import {
  readProjectDir,
  resolveProjectDir,
  slugify,
  writeProjectDir
} from '../workspace.js'

export function registerProjectTools(
  server: McpServer,
  session: Session
): void {
  server.registerTool(
    'create_project',
    {
      description:
        'Create a new blank dude project: 9 frames x 5 layers, all transparent. Replaces the currently open project in memory. Call save_project to write it to disk.',
      inputSchema: z.object({
        name: z
          .string()
          .min(1)
          .max(64)
          .describe('Dude name, e.g. "Twir" or "Cat in a hat"')
      })
    },
    async ({ name }) => {
      session.doc = newDocument(name)
      session.dir = null
      return textResult(describeDocument(session.doc))
    }
  )

  server.registerTool(
    'open_project',
    {
      description:
        'Open an existing dude package folder from the workspace. The folder must contain dude.json and body.png.',
      inputSchema: z.object({
        path: z
          .string()
          .min(1)
          .describe('Folder path relative to the workspace root')
      })
    },
    async ({ path }) => {
      try {
        const dir = resolveProjectDir(session.workspace, path)
        session.doc = await readProjectDir(dir)
        session.dir = dir
        return textResult(describeDocument(session.doc))
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'save_project',
    {
      description:
        'Write the current dude to a workspace folder: body.png, eyes.png, mouth.png, hat.png, cosmetics.png, dude.json and preview.png. Blocks on validation errors. If path is omitted, reuses the opened project path or the slugified dude name.',
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe('Folder path relative to the workspace root')
      })
    },
    async ({ path }) => {
      try {
        const doc = requireDoc(session)
        const errors = validateDocument(doc).filter(
          (issue) => issue.severity === 'error'
        )
        if (errors.length > 0) {
          throw new Error(errors.map((issue) => issue.message).join('; '))
        }

        const dir = path
          ? resolveProjectDir(session.workspace, path)
          : session.dir ??
            resolveProjectDir(session.workspace, slugify(doc.name))
        const files = await writeProjectDir(dir, doc)
        session.dir = dir

        return textResult(
          `Saved ${doc.name} to ${dir}\nFiles: ${files.join(', ')}\n${describeDocument(doc)}`
        )
      } catch (error) {
        return errorResult(error)
      }
    }
  )

  server.registerTool(
    'get_project',
    {
      description:
        'Describe the current project: name, colors, which frames are filled per layer, and validation issues.',
      inputSchema: z.object({})
    },
    async () => {
      try {
        return textResult(describeDocument(requireDoc(session)))
      } catch (error) {
        return errorResult(error)
      }
    }
  )
}
