import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localeString',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (per language)',
      type: 'localeSlug',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localeText',
      description: 'Shown at the top of the category page. Good place for SEO keywords.',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      description: 'Optional icon for the category navigation.',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'parent',
      title: 'Parent category (optional)',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'For sub-categories like "Running > Trail". Leave empty for top-level.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title (optional override)',
      type: 'localeString',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description (optional override)',
      type: 'localeText',
    }),
  ],
  preview: {
    select: { title: 'name.mk', subtitle: 'name.en', media: 'icon' },
  },
})
