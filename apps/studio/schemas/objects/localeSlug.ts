import { defineType, defineField } from 'sanity'

/**
 * Translatable URL-safe slug. One slug per locale.
 * Each language gets a "Generate" button that derives the slug
 * from the corresponding localeString field.
 *
 * Macedonian Cyrillic gets transliterated to Latin for URLs
 * (e.g. "Босоноги патики" → "bosonogi-patiki") so URLs stay
 * ASCII-only. We handle that in the slugify function.
 */

// Cyrillic → Latin transliteration map for Macedonian
const cyrillicToLatin: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ѓ: 'gj', е: 'e', ж: 'zh',
  з: 'z', ѕ: 'dz', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm',
  н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ќ: 'kj',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', џ: 'dj', ш: 'sh',
}

const transliterate = (input: string): string =>
  input
    .toLowerCase()
    .split('')
    .map((char) => cyrillicToLatin[char] ?? char)
    .join('')

const slugify = (input: string): string =>
  transliterate(input)
    .normalize('NFD')                     // strip accents (ë → e, ç → c)
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')          // any non-alphanumeric → dash
    .replace(/(^-|-$)/g, '')               // trim leading/trailing dashes
    .slice(0, 96)                          // sane URL length cap

export const localeSlug = defineType({
  name: 'localeSlug',
  title: 'Locale slug',
  type: 'object',
  fields: [
    defineField({
      name: 'mk',
      title: 'URL (MK)',
      type: 'slug',
      options: {
        source: (doc, ctx) => {
          // ctx.parent gives us the document; we read the localeString name field
          const parent = ctx.parent as { name?: { mk?: string } } | undefined
          return parent?.name?.mk ?? ''
        },
        slugify,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sq',
      title: 'URL (SQ)',
      type: 'slug',
      options: {
        source: (doc, ctx) => {
          const parent = ctx.parent as { name?: { sq?: string } } | undefined
          return parent?.name?.sq ?? ''
        },
        slugify,
      },
    }),
    defineField({
      name: 'en',
      title: 'URL (EN)',
      type: 'slug',
      options: {
        source: (doc, ctx) => {
          const parent = ctx.parent as { name?: { en?: string } } | undefined
          return parent?.name?.en ?? ''
        },
        slugify,
      },
    }),
  ],
})
