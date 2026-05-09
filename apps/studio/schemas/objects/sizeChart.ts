import { defineType, defineField } from 'sanity'

/**
 * A brand's (or specific product's) size chart.
 *
 * Each row maps an EU size to a length in millimeters.
 * The brand chooses whether that length is "foot length" (measure your foot)
 * or "insole length" (the insole inside the shoe). Be Lenka publishes insole
 * lengths; Vivobarefoot publishes foot length recommendations. We respect
 * each brand's own convention rather than forcing one standard.
 *
 * UK/US conversions are NOT stored — they're computed on the frontend
 * from the EU size using a standard conversion table. One source of truth.
 */
export const sizeChartRow = defineType({
  name: 'sizeChartRow',
  title: 'Size chart row',
  type: 'object',
  fields: [
    defineField({
      name: 'sizeEU',
      title: 'EU size',
      type: 'number',
      validation: (Rule) => Rule.required().min(15).max(50),
    }),
    defineField({
      name: 'lengthMM',
      title: 'Length (mm)',
      type: 'number',
      description:
        'The measurement value for this size, in millimeters. ' +
        'Whether this represents foot length or insole length is set on the chart itself.',
      validation: (Rule) => Rule.required().min(100).max(350),
    }),
  ],
  preview: {
    select: { eu: 'sizeEU', mm: 'lengthMM' },
    prepare: ({ eu, mm }) => ({
      title: `EU ${eu}`,
      subtitle: `${mm} mm`,
    }),
  },
})

export const sizeChart = defineType({
  name: 'sizeChart',
  title: 'Size chart',
  type: 'object',
  fields: [
    defineField({
      name: 'measurementType',
      title: 'Measurement represents',
      type: 'string',
      options: {
        list: [
          { title: 'Foot length (measure your foot)', value: 'footLengthMM' },
          { title: 'Insole length (length inside the shoe)', value: 'insoleLengthMM' },
        ],
        layout: 'radio',
      },
      description:
        'How the brand publishes their sizing. Foot length = "your foot must be this long." ' +
        'Insole length = "the shoe is this long inside." Be Lenka uses insole length; most others use foot length.',
      initialValue: 'footLengthMM',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rows',
      title: 'Size rows',
      type: 'array',
      of: [{ type: 'sizeChartRow' }],
      validation: (Rule) => Rule.min(1).error('At least one size row is required'),
    }),
    defineField({
      name: 'notes',
      title: 'Sizing notes',
      type: 'localeText',
      description:
        'Brand-specific guidance shown above the chart. ' +
        'e.g. "Add 8–10 mm to your foot length for movement room" or "Runs half size small."',
    }),
  ],
})
