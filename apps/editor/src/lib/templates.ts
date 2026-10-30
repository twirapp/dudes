import { readPackage } from '@twirapp/dudes-sprite'
import type { SpriteDocument } from '@twirapp/dudes-sprite'

export type TemplateId = 'dude' | 'cat' | 'devil'

export interface TemplateInfo {
  id: TemplateId
  name: string
  url: string
  preview: string
}

const base = import.meta.env.BASE_URL

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'dude',
    name: 'Dude',
    url: `${base}templates/dude.zip`,
    preview: `${base}templates/dude.png`
  },
  {
    id: 'cat',
    name: 'Cat',
    url: `${base}templates/cat.zip`,
    preview: `${base}templates/cat.png`
  },
  {
    id: 'devil',
    name: 'Devil',
    url: `${base}templates/devil.zip`,
    preview: `${base}templates/devil.png`
  }
]

export async function loadTemplate(id: TemplateId): Promise<SpriteDocument> {
  const template = TEMPLATES.find((item) => item.id === id)
  if (!template) throw new Error(`Unknown template: ${id}`)

  const response = await fetch(template.url)
  if (!response.ok) {
    throw new Error(`Failed to load template ${id}: ${response.status}`)
  }

  return readPackage(new Uint8Array(await response.arrayBuffer()))
}
