import { defineType, defineField } from 'sanity'

export const shippingZone = defineType({
  name: 'shippingZone',
  title: 'Shipping zone',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Zone name',
      type: 'localeString',
    }),
    defineField({
      name: 'countries',
      title: 'Countries (ISO codes)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'ISO 3166-1 alpha-2 codes, e.g. ["MK"], ["AL", "XK"]',
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'basePrice',
      title: 'Shipping price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'MKD — Macedonian Denar', value: 'MKD' },
          { title: 'EUR — Euro', value: 'EUR' },
          { title: 'ALL — Albanian Lek', value: 'ALL' },
          { title: 'RSD — Serbian Dinar', value: 'RSD' },
          { title: 'BAM — Bosnia mark', value: 'BAM' },
        ],
      },
      initialValue: 'MKD',
    }),
    defineField({
      name: 'freeShippingThreshold',
      title: 'Free shipping threshold',
      type: 'number',
      description: '0 = no free shipping. Otherwise, orders above this total ship free.',
      initialValue: 0,
    }),
    defineField({
      name: 'estimatedDays',
      title: 'Estimated delivery (days)',
      type: 'string',
      description: 'e.g. "1-2", "3-5"',
    }),
    defineField({
      name: 'allowedPaymentMethods',
      title: 'Allowed payment methods',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Cash on delivery', value: 'cod' },
          { title: 'Bank transfer', value: 'bankTransfer' },
          { title: 'Card', value: 'card' },
        ],
      },
      description: 'COD typically only for domestic. Cards/bank for international.',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle off to hide this zone without deleting it.',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'notes',
      title: 'Notes (shown at checkout)',
      type: 'localeText',
      description: 'e.g. "Customs duties may apply on delivery"',
    }),
  ],
  preview: {
    select: { title: 'name.mk', countries: 'countries', active: 'active', price: 'basePrice', currency: 'currency' },
    prepare: ({ title, countries, active, price, currency }) => ({
      title: `${title ?? '—'} ${active ? '' : '(inactive)'}`,
      subtitle: `${(countries ?? []).join(', ')} · ${price} ${currency}`,
    }),
  },
})
