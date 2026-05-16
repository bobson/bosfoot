/**
 * JSON-LD structured data helpers.
 *
 * Each builder returns a plain object that Astro pages stringify into a
 * <script type="application/ld+json"> tag. Google reads these to power
 * rich results (price/availability badges, breadcrumb trails, sitelinks).
 *
 * Schemas used:
 *   - Organization + WebSite — on every page, via BaseLayout
 *   - Product             — on /[lang]/products/[slug]
 *   - Article             — on /[lang]/articles/[slug]
 *   - BreadcrumbList      — wherever the user is more than one level deep
 *
 * All URLs are absolute. Pass `siteUrl` from `Astro.site` (configured in
 * astro.config.mjs as https://bosfoot.com).
 */

import type { SiteSettings, ProductDetail, ArticleDetail } from './queries'
import type { Locale } from './i18n'
import { pickLocale } from './i18n'

function absolute(siteUrl: URL | string, path: string): string {
  const base = typeof siteUrl === 'string' ? siteUrl : siteUrl.toString()
  return new URL(path, base).toString()
}

export function organizationLD(opts: {
  siteUrl: URL | string
  siteSettings: SiteSettings | null
}): Record<string, unknown> {
  const { siteUrl, siteSettings } = opts
  const social = siteSettings?.social
  const sameAs = [social?.instagram, social?.facebook, social?.tiktok].filter(
    (v): v is string => Boolean(v),
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteSettings?.siteName ?? 'Bosfoot',
    url: absolute(siteUrl, '/'),
    logo: absolute(siteUrl, '/images/logo.svg'),
    ...(siteSettings?.contact?.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: siteSettings.contact.email,
        ...(siteSettings.contact.phone && {
          telephone: siteSettings.contact.phone,
        }),
        contactType: 'customer service',
        areaServed: ['MK', 'AL', 'XK', 'RS', 'BG'],
        availableLanguage: ['mk', 'sq', 'en'],
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  }
}

export function websiteLD(opts: {
  siteUrl: URL | string
  siteSettings: SiteSettings | null
  locale: Locale
}): Record<string, unknown> {
  const { siteUrl, siteSettings, locale } = opts
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteSettings?.siteName ?? 'Bosfoot',
    url: absolute(siteUrl, `/${locale}/`),
    inLanguage: locale,
  }
}

export function productLD(opts: {
  siteUrl: URL | string
  product: ProductDetail
  locale: Locale
  pageUrl: string
  imageUrl?: string
}): Record<string, unknown> {
  const { siteUrl, product, locale, pageUrl, imageUrl } = opts
  const name = pickLocale(product.name, locale) ?? product.sku
  const description = pickLocale(product.shortDescription, locale)

  // Aggregate stock across variants — used for availability.
  const totalStock = (product.variants ?? []).reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0,
  )
  const inStock = totalStock > 0 && product.status === 'active'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand.name} ${name}`,
    sku: product.sku,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
    },
    offers: {
      '@type': 'Offer',
      url: absolute(siteUrl, pageUrl),
      priceCurrency: 'MKD',
      price: product.price,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      ...(product.compareAtPrice && {
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: product.price,
          priceCurrency: 'MKD',
        },
      }),
    },
  }
}

export function articleLD(opts: {
  siteUrl: URL | string
  article: ArticleDetail
  locale: Locale
  pageUrl: string
  imageUrl?: string
}): Record<string, unknown> {
  const { siteUrl, article, locale, pageUrl, imageUrl } = opts
  const headline = pickLocale(article.title, locale) ?? 'Article'
  const description = pickLocale(article.lead, locale)

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    ...(article.publishedAt && {
      datePublished: article.publishedAt,
    }),
    mainEntityOfPage: absolute(siteUrl, pageUrl),
    inLanguage: locale,
  }
}

export type BreadcrumbItem = { name: string; url: string }

export function breadcrumbLD(opts: {
  siteUrl: URL | string
  items: BreadcrumbItem[]
}): Record<string, unknown> {
  const { siteUrl, items } = opts
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(siteUrl, item.url),
    })),
  }
}
