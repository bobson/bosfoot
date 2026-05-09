import { createClient, type SanityClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(import.meta.dirname, '..', 'apps', 'studio', '.env') })

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'
const token = process.env.SANITY_IMPORT_TOKEN

if (!projectId) {
  console.error('Missing SANITY_STUDIO_PROJECT_ID in apps/studio/.env')
  process.exit(1)
}

if (!token) {
  console.error(
    [
      '',
      'Missing SANITY_IMPORT_TOKEN.',
      '',
      'Generate one at:',
      `  https://www.sanity.io/manage/project/${projectId}/api/tokens`,
      '',
      'Click "Add API token", give it a name like "Import script",',
      'choose permissions: "Editor". Copy the token and add it to',
      'apps/studio/.env as:',
      '',
      '  SANITY_IMPORT_TOKEN=skXXXXX...',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

export const client: SanityClient = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
})

export const sanityProjectInfo = { projectId, dataset }
