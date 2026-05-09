import { defineType, defineField } from 'sanity'

/**
 * Reusable translatable short-text field.
 * Use for: product names, button labels, color names, anything one-line.
 *
 * Renders in the Studio as three side-by-side inputs, one per language.
 * MK is required (home market); SQ and EN are recommended but allow
 * drafts to be saved without them.
 */
export const localeString = defineType({
  name: 'localeString',
  title: 'Locale string',
  type: 'object',
  fields: [
    defineField({
      name: 'mk',
      title: 'Македонски',
      type: 'string',
      validation: (Rule) => Rule.required().error('Macedonian translation is required'),
    }),
    defineField({
      name: 'sq',
      title: 'Shqip',
      type: 'string',
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
    }),
  ],
})
