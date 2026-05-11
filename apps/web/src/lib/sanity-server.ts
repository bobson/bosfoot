/**
 * Server-side Sanity client with write access.
 *
 * This client uses a private API token (SANITY_WRITE_TOKEN) to create/update
 * documents. It must NEVER be imported into a React component or any code
 * that ships to the browser — the token would leak to anyone viewing source.
 *
 * Astro keeps server-only code separate from client bundles as long as the
 * import isn't reached from a `client:*` component. This file is only ever
 * imported by API routes and pages with `export const prerender = false`.
 */

import { createClient } from '@sanity/client'

const projectId =
    import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? import.meta.env.SANITY_PROJECT_ID
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production'
const token = import.meta.env.SANITY_WRITE_TOKEN

if (!projectId) {
    throw new Error('Missing PUBLIC_SANITY_PROJECT_ID env var')
}
if (!token) {
    throw new Error(
        'Missing SANITY_WRITE_TOKEN env var. Generate one at sanity.io/manage and add it to apps/web/.env (no PUBLIC_ prefix).',
    )
}

export const sanityWrite = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    token,
    useCdn: false,
    perspective: 'published',
})