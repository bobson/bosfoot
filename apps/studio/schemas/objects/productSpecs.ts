import { defineType, defineField } from 'sanity'

/**
 * Barefoot shoe specs.
 * These are the fields that DIFFER between models — the universal
 * "wide toe box, zero drop, flexible" assumptions are not listed
 * because every shoe Bosfoot sells has them by definition.
 */
export const productSpecs = defineType({
  name: 'productSpecs',
  title: 'Specs',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'soleThicknessMM',
      title: 'Sole thickness (mm)',
      type: 'number',
      description: 'Total stack height. 3mm = minimal, 8mm = trail/winter.',
      validation: (Rule) => Rule.min(0).max(20),
    }),
    defineField({
      name: 'weightGrams',
      title: 'Weight per shoe (g)',
      type: 'number',
      description: "Per single shoe, women's EU 38 or men's EU 42 reference size.",
    }),
    defineField({
      name: 'waterproof',
      title: 'Waterproof',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'insulation',
      title: 'Insulated (winter)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'insoleRemovable',
      title: 'Removable insole',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'closure',
      title: 'Closure',
      type: 'string',
      options: {
        list: [
          { title: 'Laces', value: 'laces' },
          { title: 'Velcro', value: 'velcro' },
          { title: 'Slip-on', value: 'slipOn' },
          { title: 'Elastic', value: 'elastic' },
          { title: 'Buckle', value: 'buckle' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'upperMaterial',
      title: 'Upper material',
      type: 'localeString',
      description: 'e.g. "Recycled polyester" / "Leather" / "Hemp canvas"',
    }),
    defineField({
      name: 'soleMaterial',
      title: 'Sole material',
      type: 'localeString',
    }),
    defineField({
      name: 'lining',
      title: 'Lining',
      type: 'localeString',
    }),
    defineField({
      name: 'vegan',
      title: 'Vegan',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'madeIn',
      title: 'Made in (country code)',
      type: 'string',
      description: 'ISO 3166-1 alpha-2, e.g. "PT" for Portugal, "VN" for Vietnam.',
      validation: (Rule) => Rule.length(2).uppercase(),
    }),
    defineField({
      name: 'sizingNotes',
      title: 'Sizing notes',
      type: 'localeText',
      description: 'e.g. "Runs half size small, size up if between sizes."',
    }),
  ],
})
