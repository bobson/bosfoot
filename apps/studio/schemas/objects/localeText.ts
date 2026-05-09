import { defineType, defineField } from 'sanity'

/**
 * Reusable translatable long-text field.
 * Use for: product short descriptions, brand stories, sizing notes.
 *
 * Same structure as localeString but renders as multi-line textareas.
 */
export const localeText = defineType({
  name: 'localeText',
  title: 'Locale text',
  type: 'object',
  fields: [
    defineField({
      name: 'mk',
      title: 'Македонски',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().error('Macedonian translation is required'),
    }),
    defineField({
      name: 'sq',
      title: 'Shqip',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
    }),
  ],
})
