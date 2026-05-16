import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

/**
 * Bosfoot Sanity Studio configuration.
 *
 * Singletons (siteSettings) are enforced by the structure builder
 * below — they appear at the top of the menu and can't be duplicated
 * or deleted.
 */
export default defineConfig({
  name: 'bosfoot',
  title: 'Bosfoot',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // ── Singletons (top of menu) ─────────────────────
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings'),
              ),
            S.divider(),

            // ── Catalog ──────────────────────────────────────
            S.documentTypeListItem('product').title('Products'),
            S.documentTypeListItem('brand').title('Brands'),
            S.documentTypeListItem('category').title('Categories'),
            S.divider(),

            // ── Editorial ────────────────────────────────────
            S.documentTypeListItem('article').title('Articles'),
            S.divider(),

            // ── Operations ───────────────────────────────────
            S.documentTypeListItem('order').title('Orders'),
            S.documentTypeListItem('shippingZone').title('Shipping zones'),
          ]),
    }),
    visionTool(), // GROQ query playground at /vision
  ],

  schema: {
    types: schemaTypes,

    // Hide singletons from the "create new" menu and global search results.
    // They're already accessible via the structure above.
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== 'siteSettings'),
  },

  document: {
    // Prevent duplicate / delete actions on the singleton.
    actions: (input, { schemaType }) =>
      schemaType === 'siteSettings'
        ? input.filter(
            ({ action }) =>
              action !== 'duplicate' && action !== 'delete' && action !== 'unpublish',
          )
        : input,
  },
})
