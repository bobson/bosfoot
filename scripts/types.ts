/**
 * Type definitions for the catalog JSON file.
 * Mirrors the Sanity schema but uses simpler shapes that are easy to write by hand.
 */

export type LocaleString = {
  mk: string
  sq?: string
  en?: string
}

export type LocaleText = LocaleString

export type SizeChartRow = {
  sizeEU: number
  lengthMM: number
}

export type SizeChart = {
  measurementType: 'footLengthMM' | 'insoleLengthMM'
  rows: SizeChartRow[]
  notes?: LocaleText
}

export type CatalogBrand = {
  /** Stable identifier — never change this once products reference it */
  slug: string
  name: string
  countryOfOrigin?: string
  yearFounded?: number
  websiteUrl?: string
  sizingGuideUrl?: string
  description?: LocaleText
  sizeChart?: SizeChart
  featured?: boolean
  order?: number
}

export type CatalogCategory = {
  slug: string
  name: LocaleString
  description?: LocaleText
  parentSlug?: string
  order?: number
}

export type CatalogVariant = {
  sizeEU: number
  color?: LocaleString
  colorHex?: string
  stock: number
  /** Variant SKU — must be unique across the entire catalog */
  sku: string
}

export type ProductSpecs = {
  soleThicknessMM?: number
  soleThicknessWithInsoleMM?: number
  weightGrams?: number
  weightGramsMens?: number
  weightGramsWomens?: number
  waterproof?: boolean
  reflective?: boolean
  insulation?: boolean
  insoleRemovable?: boolean
  closure?: 'laces' | 'velcro' | 'slipOn' | 'elastic' | 'buckle'
  upperMaterial?: LocaleString
  soleMaterial?: LocaleString
  lining?: LocaleString
  vegan?: boolean
  /** ISO 3166-1 alpha-2, e.g. "PT", "VN" */
  madeIn?: string
  sizingNotes?: LocaleText
  additionalFeatures?: LocaleString[]
}

export type CatalogProduct = {
  /** Master SKU — the unique identity. Variants have their own SKUs. */
  sku: string
  brandSlug: string
  categorySlugs?: string[]
  name: LocaleString
  shortDescription?: LocaleText
  highlights?: LocaleString[]
  price: number
  compareAtPrice?: number
  costPrice?: number
  brandProductUrl?: string
  variants: CatalogVariant[]
  specs?: ProductSpecs
  activities?: Array<
    'running' | 'hiking' | 'casual' | 'training' | 'water' | 'winter' | 'office' | 'kids'
  >
  /** Target wearer — used for gender-based browsing and filtering */
  gender?: 'mens' | 'womens' | 'unisex' | 'kids'
  status?: 'draft' | 'active' | 'outOfStock' | 'archived'
  featured?: boolean
  newArrival?: boolean
  /** Free-text detail-page sections, rendered as accordion on the PDP. */
  sizeAndFit?: LocaleText
  aboutShoe?: LocaleText
  productInfo?: LocaleText
  sustainability?: LocaleText
}

export type Catalog = {
  brands: CatalogBrand[]
  categories: CatalogCategory[]
  products: CatalogProduct[]
}