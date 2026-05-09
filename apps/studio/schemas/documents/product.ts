import { defineType, defineField } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'media', title: 'Media' },
    { name: 'pricing', title: 'Pricing' },
    { name: 'variants', title: 'Variants & stock' },
    { name: 'specs', title: 'Specs' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ── Identity ────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localeString',
      group: 'main',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (per language)',
      type: 'localeSlug',
      group: 'main',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      group: 'main',
    }),
    defineField({
      name: 'sku',
      title: 'Master SKU',
      type: 'string',
      description: 'Internal product code, e.g. "VB-PL3". Variants get their own SKUs.',
      group: 'main',
    }),
    defineField({
      name: 'brandProductUrl',
      title: 'Link to product on brand website',
      type: 'url',
      description:
        'Direct URL to this exact product on the brand\'s official site. ' +
        'Shown as a "More info from {brand}" link on the product page.',
      group: 'main',
    }),

    // ── Marketing ───────────────────────────────────────────
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'localeText',
      description: '1–2 sentences. Shown in product cards and search results.',
      group: 'main',
    }),
    defineField({
      name: 'description_mk',
      title: 'Description (МК)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      group: 'main',
    }),
    defineField({
      name: 'description_sq',
      title: 'Description (SQ)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      group: 'main',
    }),
    defineField({
      name: 'description_en',
      title: 'Description (EN)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      group: 'main',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{ type: 'localeString' }],
      description: 'Bullet points: "Vegan", "Recycled materials", "Made in Portugal"',
      group: 'main',
      validation: (Rule) => Rule.max(6),
    }),

    // ── Media ───────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
      group: 'media',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
      validation: (Rule) => Rule.min(0).max(12),
    }),
    defineField({
      name: 'video',
      title: 'Video URL (YouTube/Vimeo)',
      type: 'url',
      group: 'media',
    }),

    // ── Pricing ─────────────────────────────────────────────
    defineField({
      name: 'price',
      title: 'Price (MKD)',
      type: 'number',
      description: 'Selling price in Macedonian Denar. Other currencies converted on the frontend.',
      group: 'pricing',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Compare-at price (MKD)',
      type: 'number',
      description: 'Original price for "was X now Y" display. Leave empty if not on sale.',
      group: 'pricing',
    }),
    defineField({
      name: 'costPrice',
      title: 'Cost price (MKD)',
      type: 'number',
      description: 'Internal — your import cost. Never shown on the website.',
      group: 'pricing',
    }),
    defineField({
      name: 'taxIncluded',
      title: 'Tax included in price',
      type: 'boolean',
      initialValue: true,
      group: 'pricing',
    }),

    // ── Variants ────────────────────────────────────────────
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [{ type: 'variant' }],
      group: 'variants',
      validation: (Rule) => Rule.min(1).error('At least one variant required'),
    }),

    // ── Specs ───────────────────────────────────────────────
    defineField({
      name: 'specs',
      title: 'Specs',
      type: 'productSpecs',
      group: 'specs',
    }),
    defineField({
      name: 'sizeChartOverride',
      title: 'Size chart override (optional)',
      type: 'sizeChart',
      description:
        'Only fill this in if THIS specific shoe sizes differently from the rest of the ' +
        'brand\'s range. If empty, the brand\'s default size chart is used.',
      group: 'specs',
    }),

    // ── Activities ──────────────────────────────────────────
    defineField({
      name: 'activities',
      title: 'Activities',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Running', value: 'running' },
          { title: 'Hiking', value: 'hiking' },
          { title: 'Casual', value: 'casual' },
          { title: 'Training', value: 'training' },
          { title: 'Water', value: 'water' },
          { title: 'Winter', value: 'winter' },
          { title: 'Office', value: 'office' },
          { title: 'Kids', value: 'kids' },
        ],
      },
      group: 'main',
    }),

    // ── Status ──────────────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Active', value: 'active' },
          { title: 'Out of stock', value: 'outOfStock' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      group: 'main',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on homepage',
      type: 'boolean',
      initialValue: false,
      group: 'main',
    }),
    defineField({
      name: 'newArrival',
      title: 'New arrival',
      type: 'boolean',
      initialValue: false,
      group: 'main',
    }),

    // ── SEO ─────────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'localeString',
      description: 'Optional. If empty, product name is used.',
      group: 'seo',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'localeText',
      description: 'Optional. If empty, short description is used.',
      group: 'seo',
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'main',
    }),
  ],
  preview: {
    select: {
      title: 'name.mk',
      subtitle: 'brand.name',
      status: 'status',
      media: 'mainImage',
    },
    prepare: ({ title, subtitle, status, media }) => ({
      title: title ?? '— no name —',
      subtitle: `${subtitle ?? ''} · ${status ?? 'draft'}`,
      media,
    }),
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Price (low to high)',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Price (high to low)',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
  ],
})
