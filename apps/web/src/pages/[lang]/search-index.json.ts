/**
 * Prerendered search index — one JSON file per locale.
 *
 * The header search overlay fetches this file on first open and runs a
 * substring match in the browser. It's small (~5-10KB gzipped for a few
 * hundred products) and avoids needing a search service for v1.
 *
 * If the catalog grows past a few thousand SKUs, swap this for a typesense
 * or meilisearch instance — the client-side shape stays the same.
 */
import type { APIRoute, GetStaticPaths } from 'astro'
import { LOCALES, type Locale, pickLocale } from '@/lib/i18n'
import { getAllProducts } from '@/lib/queries'
import { urlFor } from '@/lib/sanity'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () =>
  LOCALES.map((lang) => ({ params: { lang } }))

export const GET: APIRoute = async ({ params }) => {
  const locale = params.lang as Locale
  const products = await getAllProducts()

  const items = products.map((p) => {
    const slugRecord = p.slug as Record<string, { current?: string } | undefined>
    const localizedSlug =
      slugRecord[locale]?.current ??
      slugRecord.en?.current ??
      slugRecord.mk?.current ??
      slugRecord.sq?.current
    return {
      sku: p.sku,
      name: pickLocale(p.name, locale) ?? p.sku,
      brand: p.brand.name,
      brandSlug: p.brand.slug.current,
      slug: localizedSlug,
      price: p.price,
      gender: p.gender,
      image: p.mainImage
        ? urlFor(p.mainImage)
            .width(120)
            .height(120)
            .quality(70)
            .format('webp')
            .url()
        : null,
    }
  })

  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
