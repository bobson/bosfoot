import { defineType, defineField } from 'sanity'

export const brand = defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Brand name as written officially. Same in all languages.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL fragment, e.g. "vivobarefoot". Same across all locales.',
      options: {
        source: 'name',
        slugify: (input) =>
          input
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            .slice(0, 64),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'SVG preferred. Will be shown on light backgrounds.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'About this brand',
      type: 'localeText',
    }),
    defineField({
      name: 'countryOfOrigin',
      title: 'Country of origin (code)',
      type: 'string',
      description: 'ISO 3166-1 alpha-2, e.g. "GB", "US", "SK", "DE"',
      validation: (Rule) => Rule.length(2).uppercase(),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Brand website',
      type: 'url',
    }),
    defineField({
      name: 'sizingGuideUrl',
      title: "Brand's official size guide URL",
      type: 'url',
      description:
        'Direct link to the brand\'s own size guide page (e.g. xeroshoes.eu/pages/sizing). ' +
        'Shown in our size chart modal as "Read full guide on brand site".',
    }),
    defineField({
      name: 'yearFounded',
      title: 'Year founded',
      type: 'number',
      validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()),
    }),
    defineField({
      name: 'sizeChart',
      title: 'Size chart',
      type: 'sizeChart',
      description:
        'How this brand sizes their shoes. Shown on every product page from this brand ' +
        'unless the product overrides it. Get this from the brand\'s official website.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first. Used in the homepage brand strip.',
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'countryOfOrigin', media: 'logo' },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
})