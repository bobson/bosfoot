/**
 * GROQ queries for Bosfoot.
 *
 * Each query is a string template. Sanity's GROQ language is similar to
 * GraphQL but more concise — `*[_type == "product"]` is "all documents
 * where _type is product." Projections in `{...}` shape the response.
 *
 * Run any of these in the Sanity Studio's Vision tool to preview output.
 */

import { sanity } from './sanity'
import type { Locale } from './i18n'

/* ─────────────────────────────────────────────────────────────────────
   TYPES — what we get back from the queries
   ───────────────────────────────────────────────────────────────────── */

export type SiteSettings = {
  siteName: string
  tagline?: { mk?: string; sq?: string; en?: string }
  contact?: { email?: string; phone?: string; city?: string }
  social?: { instagram?: string; facebook?: string; tiktok?: string }
  announcement?: {
    enabled?: boolean
    text?: { mk?: string; sq?: string; en?: string }
    link?: string
  }
  homepage?: {
    heroTitle?: { mk?: string; sq?: string; en?: string }
    heroSubtitle?: { mk?: string; sq?: string; en?: string }
    heroImage?: SanityImage
  }
}

export type SanityImage = {
  asset: { _ref: string; _type: 'reference' }
  alt?: string
  hotspot?: { x: number; y: number }
}

export type ProductCard = {
  _id: string
  sku: string
  name: { mk?: string; sq?: string; en?: string }
  slug: { mk?: { current: string }; sq?: { current: string }; en?: { current: string } }
  price: number
  compareAtPrice?: number
  brand: { name: string; slug: { current: string } }
  mainImage?: SanityImage
  variants: Array<{ stock: number; colorHex?: string; sizeEU?: number }>
  activities?: string[]
  gender?: 'mens' | 'womens' | 'unisex' | 'kids'
  featured: boolean
  newArrival: boolean
  status: 'draft' | 'active' | 'outOfStock' | 'archived'
}

export type BrandCard = {
  _id: string
  name: string
  slug: { current: string }
  logo?: SanityImage
  countryOfOrigin?: string
  yearFounded?: number
  order?: number
}

/* ─────────────────────────────────────────────────────────────────────
   QUERIES
   ───────────────────────────────────────────────────────────────────── */

/** Singleton — the global site settings document */
const SITE_SETTINGS_QUERY = `
  *[_id == "siteSettings"][0]{
    siteName,
    tagline,
    contact,
    social,
    announcement,
    homepage{
      heroTitle,
      heroSubtitle,
      heroImage
    }
  }
`

/** Featured products for homepage — limited count, ordered by manual selection */
const FEATURED_PRODUCTS_QUERY = `
  *[_type == "product" && status == "active" && featured == true]
    | order(_createdAt desc)[0...8]{
    _id,
    sku,
    name,
    slug,
    price,
    compareAtPrice,
    "brand": brand->{name, slug},
    mainImage,
    "variants": variants[]{stock, colorHex, sizeEU},
    activities,
    gender,
    featured,
    newArrival,
    status
  }
`

/** Newest active products — for "new arrivals" homepage section */
const NEW_ARRIVALS_QUERY = `
  *[_type == "product" && status == "active" && newArrival == true]
    | order(_createdAt desc)[0...8]{
    _id,
    sku,
    name,
    slug,
    price,
    compareAtPrice,
    "brand": brand->{name, slug},
    mainImage,
    "variants": variants[]{stock, colorHex, sizeEU},
    activities,
    gender,
    featured,
    newArrival,
    status
  }
`

/** All active products for the listing page */
const ALL_PRODUCTS_QUERY = `
  *[_type == "product" && status == "active"]
    | order(_createdAt desc){
    _id,
    sku,
    name,
    slug,
    price,
    compareAtPrice,
    "brand": brand->{name, slug},
    mainImage,
    "variants": variants[]{stock, colorHex, sizeEU},
    activities,
    gender,
    featured,
    newArrival,
    status
  }
`

/** Featured brands for homepage strip */
const FEATURED_BRANDS_QUERY = `
  *[_type == "brand" && featured == true] | order(order asc, name asc){
    _id,
    name,
    slug,
    logo,
    countryOfOrigin,
    yearFounded,
    order
  }
`

/* ─────────────────────────────────────────────────────────────────────
   FETCH HELPERS
   ───────────────────────────────────────────────────────────────────── */

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanity.fetch(SITE_SETTINGS_QUERY)
}

export async function getFeaturedProducts(): Promise<ProductCard[]> {
  return sanity.fetch(FEATURED_PRODUCTS_QUERY)
}

export async function getNewArrivals(): Promise<ProductCard[]> {
  return sanity.fetch(NEW_ARRIVALS_QUERY)
}

export async function getFeaturedBrands(): Promise<BrandCard[]> {
  return sanity.fetch(FEATURED_BRANDS_QUERY)
}

export async function getAllProducts(): Promise<ProductCard[]> {
  return sanity.fetch(ALL_PRODUCTS_QUERY)
}

/* ─────────────────────────────────────────────────────────────────────
   BRAND DETAIL — for /[lang]/brands/[slug]/ pages
   ───────────────────────────────────────────────────────────────────── */

export type BrandDetail = {
  _id: string
  name: string
  slug: { current: string }
  logo?: SanityImage
  countryOfOrigin?: string
  yearFounded?: number
  websiteUrl?: string
  sizingGuideUrl?: string
  description?: { mk?: string; sq?: string; en?: string }
  sizeChart?: {
    measurementType: 'footLengthMM' | 'insoleLengthMM'
    rows: Array<{ sizeEU: number; lengthMM: number }>
    notes?: { mk?: string; sq?: string; en?: string }
  }
}

const BRAND_DETAIL_QUERY = `
  *[_type == "brand" && slug.current == $slug][0]{
    _id,
    name,
    slug,
    logo,
    countryOfOrigin,
    yearFounded,
    websiteUrl,
    sizingGuideUrl,
    description,
    sizeChart
  }
`

const PRODUCTS_BY_BRAND_QUERY = `
  *[_type == "product" && status == "active" && brand->slug.current == $slug]
    | order(_createdAt desc){
    _id,
    sku,
    name,
    slug,
    price,
    compareAtPrice,
    "brand": brand->{name, slug},
    mainImage,
    "variants": variants[]{stock, colorHex, sizeEU},
    activities,
    gender,
    featured,
    newArrival,
    status
  }
`

const ALL_BRAND_SLUGS_QUERY = `*[_type == "brand"].slug.current`

export async function getBrand(slug: string): Promise<BrandDetail | null> {
  return sanity.fetch(BRAND_DETAIL_QUERY, { slug })
}

export async function getProductsByBrand(slug: string): Promise<ProductCard[]> {
  return sanity.fetch(PRODUCTS_BY_BRAND_QUERY, { slug })
}

export async function getAllBrandSlugs(): Promise<string[]> {
  return sanity.fetch(ALL_BRAND_SLUGS_QUERY)
}

/* ─────────────────────────────────────────────────────────────────────
   PRODUCT DETAIL — for /[lang]/products/[slug]/ pages
   ───────────────────────────────────────────────────────────────────── */

export type PortableTextBlock = {
  _type: string
  _key?: string
  children?: Array<{ _type: string; text: string; marks?: string[] }>
  style?: string
  markDefs?: Array<{ _type: string; _key: string; href?: string }>
  asset?: { _ref: string }
}

export type Variant = {
  _key: string
  sizeEU: number
  color?: { mk?: string; sq?: string; en?: string }
  colorHex?: string
  stock: number
  sku: string
}

export type SizeChart = {
  measurementType: 'footLengthMM' | 'insoleLengthMM'
  rows: Array<{ sizeEU: number; lengthMM: number }>
  notes?: { mk?: string; sq?: string; en?: string }
}

export type ProductDetail = {
  _id: string
  sku: string
  name: { mk?: string; sq?: string; en?: string }
  slug: { mk?: { current: string }; sq?: { current: string }; en?: { current: string } }
  price: number
  compareAtPrice?: number
  brandProductUrl?: string
  shortDescription?: { mk?: string; sq?: string; en?: string }
  description_mk?: PortableTextBlock[]
  description_sq?: PortableTextBlock[]
  description_en?: PortableTextBlock[]
  highlights?: Array<{ _key?: string; mk?: string; sq?: string; en?: string }>
  mainImage?: SanityImage
  gallery?: SanityImage[]
  variants: Variant[]
  specs?: {
    soleThicknessMM?: number
    soleThicknessWithInsoleMM?: number
    weightGrams?: number
    weightGramsMens?: number
    weightGramsWomens?: number
    waterproof?: boolean
    reflective?: boolean
    insulation?: boolean
    insoleRemovable?: boolean
    closure?: string
    upperMaterial?: { mk?: string; sq?: string; en?: string }
    soleMaterial?: { mk?: string; sq?: string; en?: string }
    lining?: { mk?: string; sq?: string; en?: string }
    vegan?: boolean
    madeIn?: string
    sizingNotes?: { mk?: string; sq?: string; en?: string }
    additionalFeatures?: Array<{ _key?: string; mk?: string; sq?: string; en?: string }>
  }
  sizeChartOverride?: SizeChart
  gender?: 'mens' | 'womens' | 'unisex' | 'kids'
  activities?: string[]
  status: 'draft' | 'active' | 'outOfStock' | 'archived'
  brand: {
    _id: string
    name: string
    slug: { current: string }
    countryOfOrigin?: string
    yearFounded?: number
    websiteUrl?: string
    sizingGuideUrl?: string
    logo?: SanityImage
    description?: { mk?: string; sq?: string; en?: string }
    sizeChart?: SizeChart
  }
}

const PRODUCT_DETAIL_QUERY = `
  *[_type == "product" && status == "active" &&
    (slug.mk.current == $slug || slug.en.current == $slug || slug.sq.current == $slug)][0]{
    _id,
    sku,
    name,
    slug,
    price,
    compareAtPrice,
    brandProductUrl,
    shortDescription,
    description_mk,
    description_sq,
    description_en,
    highlights,
    mainImage,
    gallery,
    "variants": variants[]{_key, sizeEU, color, colorHex, stock, sku},
    specs,
    sizeChartOverride,
    gender,
    activities,
    status,
    "brand": brand->{
      _id,
      name,
      slug,
      countryOfOrigin,
      yearFounded,
      websiteUrl,
      sizingGuideUrl,
      logo,
      description,
      sizeChart
    }
  }
`

const ALL_PRODUCT_SLUGS_QUERY = `
  *[_type == "product" && status == "active"]{
    "mk": slug.mk.current,
    "sq": slug.sq.current,
    "en": slug.en.current
  }
`

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return sanity.fetch(PRODUCT_DETAIL_QUERY, { slug })
}

export async function getAllProductSlugs(): Promise<
  Array<{ mk?: string; sq?: string; en?: string }>
> {
  return sanity.fetch(ALL_PRODUCT_SLUGS_QUERY)
}

/** Helper to compute total stock across a product's variants */
export function totalStock(product: Pick<ProductCard, 'variants'>): number {
  return product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
}

/** Pick the right slug for a locale, with fallbacks */
export function productSlug(product: ProductCard, locale: Locale): string {
  return (
    product.slug[locale]?.current ??
    product.slug.mk?.current ??
    product.slug.en?.current ??
    product.sku.toLowerCase()
  )
}