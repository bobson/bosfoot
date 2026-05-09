import { defineType, defineField } from 'sanity'

export const order = defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'customer', title: 'Customer' },
    { name: 'items', title: 'Items' },
    { name: 'fulfillment', title: 'Fulfillment' },
    { name: 'internal', title: 'Internal notes' },
  ],
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Order number',
      type: 'string',
      description: 'Auto-generated, e.g. BOS-2026-0001',
      readOnly: true,
      group: 'overview',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      readOnly: true,
      group: 'overview',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Packed', value: 'packed' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Returned', value: 'returned' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
      group: 'overview',
    }),

    // ── Customer ────────────────────────────────────────────
    defineField({
      name: 'customer',
      title: 'Customer',
      type: 'object',
      group: 'customer',
      fields: [
        defineField({ name: 'firstName', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'lastName', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'email', type: 'email', validation: (R) => R.required() }),
        defineField({ name: 'phone', type: 'string', validation: (R) => R.required() }),
        defineField({
          name: 'language',
          title: 'Language at checkout',
          type: 'string',
          options: { list: ['mk', 'sq', 'en'] },
          description: 'Used to send order emails in the right language.',
        }),
      ],
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Shipping address',
      type: 'object',
      group: 'customer',
      fields: [
        defineField({ name: 'street', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'city', type: 'string', validation: (R) => R.required() }),
        defineField({ name: 'postalCode', type: 'string' }),
        defineField({ name: 'country', type: 'string', description: 'ISO code, e.g. MK' }),
        defineField({ name: 'notes', type: 'text', rows: 2 }),
      ],
    }),

    // ── Items ───────────────────────────────────────────────
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      group: 'items',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'productId', type: 'string' }),
            defineField({ name: 'productName', type: 'string' }),
            defineField({ name: 'brandName', type: 'string' }),
            defineField({ name: 'variantSku', type: 'string' }),
            defineField({ name: 'sizeEU', type: 'number' }),
            defineField({ name: 'color', type: 'string' }),
            defineField({ name: 'quantity', type: 'number' }),
            defineField({ name: 'unitPrice', type: 'number' }),
            defineField({ name: 'lineTotal', type: 'number' }),
          ],
          preview: {
            select: { title: 'productName', size: 'sizeEU', color: 'color', qty: 'quantity', total: 'lineTotal' },
            prepare: ({ title, size, color, qty, total }) => ({
              title: `${title} — EU ${size}, ${color}`,
              subtitle: `${qty}× = ${total} MKD`,
            }),
          },
        },
      ],
    }),

    // ── Money ───────────────────────────────────────────────
    defineField({ name: 'subtotal', title: 'Subtotal', type: 'number', group: 'overview' }),
    defineField({ name: 'shippingCost', title: 'Shipping', type: 'number', group: 'overview' }),
    defineField({ name: 'total', title: 'Total', type: 'number', group: 'overview' }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      initialValue: 'MKD',
      group: 'overview',
    }),

    // ── Payment ─────────────────────────────────────────────
    defineField({
      name: 'paymentMethod',
      title: 'Payment method',
      type: 'string',
      options: {
        list: [
          { title: 'Cash on delivery', value: 'cod' },
          { title: 'Bank transfer', value: 'bankTransfer' },
          { title: 'Card', value: 'card' },
        ],
      },
      group: 'overview',
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment status',
      type: 'string',
      options: {
        list: ['pending', 'paid', 'failed', 'refunded'],
      },
      initialValue: 'pending',
      group: 'overview',
    }),
    defineField({
      name: 'paymentReference',
      title: 'Payment reference',
      type: 'string',
      description: 'Bank transaction ID or Monri reference',
      group: 'overview',
    }),

    // ── Fulfillment ─────────────────────────────────────────
    defineField({ name: 'trackingNumber', type: 'string', group: 'fulfillment' }),
    defineField({ name: 'courier', type: 'string', group: 'fulfillment' }),
    defineField({ name: 'shippedAt', type: 'datetime', group: 'fulfillment' }),
    defineField({ name: 'deliveredAt', type: 'datetime', group: 'fulfillment' }),

    // ── Internal ────────────────────────────────────────────
    defineField({
      name: 'internalNotes',
      type: 'text',
      rows: 4,
      description: 'Visible to admins only.',
      group: 'internal',
    }),
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      first: 'customer.firstName',
      last: 'customer.lastName',
      total: 'total',
      status: 'status',
    },
    prepare: ({ orderNumber, first, last, total, status }) => ({
      title: `${orderNumber ?? 'Order'} — ${first ?? ''} ${last ?? ''}`,
      subtitle: `${total ?? 0} MKD · ${status ?? 'new'}`,
    }),
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
