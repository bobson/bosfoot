import { defineType, defineField } from 'sanity'

/**
 * Singleton document — only one instance ever exists.
 * Enforced in sanity.config.ts via structure builder.
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'social', title: 'Social' },
    { name: 'business', title: 'Business' },
    { name: 'homepage', title: 'Homepage' },
    { name: 'announcement', title: 'Announcement bar' },
    { name: 'seo', title: 'Default SEO' },
    { name: 'chat', title: 'Chat agent' },
  ],
  fields: [
    defineField({ name: 'siteName', type: 'string', initialValue: 'Bosfoot', group: 'general' }),
    defineField({ name: 'tagline', type: 'localeString', group: 'general' }),
    defineField({ name: 'logo', type: 'image', group: 'general' }),

    // Contact
    defineField({
      name: 'contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'email', type: 'email' }),
        defineField({ name: 'phone', type: 'string' }),
        defineField({ name: 'addressLine1', type: 'string' }),
        defineField({ name: 'addressLine2', type: 'string' }),
        defineField({ name: 'city', type: 'string' }),
        defineField({ name: 'postalCode', type: 'string' }),
        defineField({ name: 'country', type: 'string' }),
        defineField({ name: 'googleMapsUrl', type: 'url' }),
      ],
    }),

    // Social
    defineField({
      name: 'social',
      type: 'object',
      group: 'social',
      fields: [
        defineField({ name: 'instagram', type: 'url' }),
        defineField({ name: 'facebook', type: 'url' }),
        defineField({ name: 'tiktok', type: 'url' }),
        defineField({ name: 'youtube', type: 'url' }),
      ],
    }),

    // Business / legal
    defineField({
      name: 'business',
      type: 'object',
      group: 'business',
      fields: [
        defineField({ name: 'legalName', type: 'string' }),
        defineField({ name: 'registrationNumber', type: 'string' }),
        defineField({ name: 'vatNumber', type: 'string' }),
        defineField({ name: 'bankAccount', type: 'string', description: 'IBAN for bank-transfer orders' }),
        defineField({ name: 'bankName', type: 'string' }),
      ],
    }),

    // Homepage
    defineField({
      name: 'homepage',
      type: 'object',
      group: 'homepage',
      fields: [
        defineField({ name: 'heroTitle', type: 'localeString' }),
        defineField({ name: 'heroSubtitle', type: 'localeText' }),
        defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'heroCtaText', type: 'localeString' }),
        defineField({ name: 'heroCtaLink', type: 'string', description: 'e.g. /products' }),
        defineField({
          name: 'featuredCategoryRef',
          type: 'reference',
          to: [{ type: 'category' }],
        }),
      ],
    }),

    // Announcement bar
    defineField({
      name: 'announcement',
      type: 'object',
      group: 'announcement',
      fields: [
        defineField({ name: 'enabled', type: 'boolean', initialValue: false }),
        defineField({ name: 'text', type: 'localeString' }),
        defineField({ name: 'link', type: 'string' }),
      ],
    }),

    // Default SEO
    defineField({
      name: 'defaultSeo',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'title', type: 'localeString' }),
        defineField({ name: 'description', type: 'localeText' }),
        defineField({ name: 'ogImage', type: 'image' }),
      ],
    }),

    // Chat agent
    defineField({
      name: 'chatFaq',
      title: 'Chat agent knowledge base',
      type: 'localeText',
      group: 'chat',
      description:
        'Free-form text the chat agent uses when answering customer questions: shipping, returns, payment, brand voice, anything specific to Bosfoot that isn\'t in the size charts. Write it like notes for a new employee. Three languages — the agent picks based on the customer\'s message.',
      rows: 20,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
