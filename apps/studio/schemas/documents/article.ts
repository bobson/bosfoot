import { defineType, defineField } from 'sanity'

/**
 * Article — for the "Why barefoot" / blog content.
 *
 * Kept simple for v1: title, slug, lead, body (Portable Text), cover image,
 * publish date, optional author name. Add categories/tags later if it grows.
 */
export const article = defineType({
    name: 'article',
    title: 'Article',
    type: 'document',
    groups: [
        { name: 'main', title: 'Main', default: true },
        { name: 'content', title: 'Content' },
        { name: 'seo', title: 'SEO' },
    ],
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'localeString',
            group: 'main',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'localeSlug',
            group: 'main',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'coverImage',
            title: 'Cover image',
            type: 'image',
            options: { hotspot: true },
            group: 'main',
        }),
        defineField({
            name: 'lead',
            title: 'Lead / summary',
            type: 'localeText',
            description: 'Short summary shown on the article list and homepage teaser.',
            group: 'main',
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            group: 'main',
        }),
        defineField({
            name: 'author',
            title: 'Author name',
            type: 'string',
            group: 'main',
        }),
        defineField({
            name: 'featured',
            title: 'Featured on homepage',
            type: 'boolean',
            initialValue: false,
            group: 'main',
        }),

        // Content per locale (same pattern as product description)
        defineField({
            name: 'body_mk',
            title: 'Body (Македонски)',
            type: 'array',
            of: [
                { type: 'block' },
                { type: 'image', options: { hotspot: true } },
            ],
            group: 'content',
        }),
        defineField({
            name: 'body_sq',
            title: 'Body (Shqip)',
            type: 'array',
            of: [
                { type: 'block' },
                { type: 'image', options: { hotspot: true } },
            ],
            group: 'content',
        }),
        defineField({
            name: 'body_en',
            title: 'Body (English)',
            type: 'array',
            of: [
                { type: 'block' },
                { type: 'image', options: { hotspot: true } },
            ],
            group: 'content',
        }),

        // SEO
        defineField({
            name: 'seo',
            title: 'SEO',
            type: 'object',
            group: 'seo',
            fields: [
                { name: 'metaTitle', type: 'localeString', title: 'Meta title' },
                { name: 'metaDescription', type: 'localeText', title: 'Meta description' },
            ],
        }),
    ],

    preview: {
        select: { title: 'title.mk', date: 'publishedAt', media: 'coverImage' },
        prepare: ({ title, date, media }) => ({
            title: title ?? 'Untitled',
            subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
            media,
        }),
    },
})