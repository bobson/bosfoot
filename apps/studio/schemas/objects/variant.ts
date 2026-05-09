import { defineType, defineField } from 'sanity'

/**
 * A single sellable variant: one size + one color = one SKU.
 * EU size is the source of truth; US/UK conversions are computed
 * on the frontend from a lookup table, not stored here.
 */
export const variant = defineType({
  name: 'variant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'sizeEU',
      title: 'EU size',
      type: 'number',
      description: 'EU size, half-sizes allowed (e.g. 36.5)',
      validation: (Rule) => Rule.required().min(15).max(50),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'localeString',
    }),
    defineField({
      name: 'colorHex',
      title: 'Color hex',
      type: 'string',
      description: 'For swatch display, e.g. "#1a1a1a"',
      validation: (Rule) =>
        Rule.regex(/^#[0-9A-Fa-f]{6}$/).warning('Should be a 6-digit hex like #1a1a1a'),
    }),
    defineField({
      name: 'stock',
      title: 'Stock (units)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0).integer(),
      initialValue: 0,
    }),
    defineField({
      name: 'sku',
      title: 'Variant SKU',
      type: 'string',
      description: 'Internal code, e.g. "VB-PL3-BLK-39"',
    }),
    defineField({
      name: 'images',
      title: 'Color-specific images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Optional. Use only if this color needs different photos than the main gallery.',
    }),
  ],
  preview: {
    select: { size: 'sizeEU', color: 'color.mk', stock: 'stock', hex: 'colorHex' },
    prepare: ({ size, color, stock, hex }) => ({
      title: `EU ${size} — ${color ?? '—'}`,
      subtitle: `${stock ?? 0} in stock`,
      media: hex
        ? () => ({ type: 'span', props: { style: { background: hex, width: 30, height: 30, display: 'block', borderRadius: 4 } } })
        : undefined,
    }),
  },
})
