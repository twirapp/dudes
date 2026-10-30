import { createDocument } from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

export interface Session {
  doc: SpriteDocument | null
  dir: string | null
  workspace: string
}

export function createSession(workspace: string): Session {
  return { doc: null, dir: null, workspace }
}

export function requireDoc(session: Session): SpriteDocument {
  if (!session.doc) {
    throw new Error('No project is open. Call create_project or open_project first.')
  }
  return session.doc
}

export function newDocument(name: string): SpriteDocument {
  return createDocument(name)
}
