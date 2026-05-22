/**
 * Freet brand extractor.
 *
 * Reads the canonical source under `data/freet/` (edited by the user) and
 * folds it into `data/catalog.json` so the standard `pnpm catalog:apply`
 * importer can push to Sanity.
 *
 * Source shape (all editable):
 *   data/freet/
 *     brand.json                ← brand metadata + size chart
 *     {shoe-slug}/
 *       shoe.json               ← all editable fields: name, price, stock per size,
 *                                 colors, activities, status, MK/SQ/EN translations
 *       images/
 *         {slug}.webp           ← main image (catalog importer convention)
 *         {slug}-1.webp         ← gallery 1
 *         ...
 *
 * What this does:
 *   1. Reads data/freet/brand.json → builds the brand catalog entry
 *   2. Reads each data/freet/{slug}/shoe.json → builds product entries
 *   3. Generates variants from the stock map (one variant per size in stock object)
 *   4. Merges Freet brand + products into data/catalog.json
 *      (existing Freet entries get replaced; non-Freet entries untouched)
 *
 * Run with:
 *   pnpm extract:freet
 *
 * Then push to Sanity with:
 *   pnpm catalog        # dry-run review
 *   pnpm catalog:apply  # push
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  Catalog,
  CatalogBrand,
  CatalogProduct,
  CatalogVariant,
  LocaleText,
  LocaleString,
} from './types.js'

// ─── Paths ────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const FREET_DIR = resolve(REPO_ROOT, 'data', 'freet')
const CATALOG_PATH = resolve(REPO_ROOT, 'data', 'catalog.json')
const BRAND_SLUG = 'freet'

// ─── Source file shapes ───────────────────────────────────────────────
// These mirror what the user edits in data/freet/{slug}/shoe.json.

interface ShoeColor {
  name: LocaleString
  hex: string
}

interface ShoeSource {
  name: LocaleString
  price: number
  status?: 'draft' | 'active' | 'outOfStock' | 'archived'
  gender?: 'mens' | 'womens' | 'unisex' | 'kids'
  activities?: string[]
  highlights?: LocaleString[]
  colors?: ShoeColor[]
  /** Stock by EU size, keyed as string. Sizes with stock 0 still get a variant. */
  stock?: Record<string, number>
  shortDescription?: LocaleText
  aboutShoe?: LocaleText
  sizeAndFit?: LocaleText
  productInfo?: LocaleText
  sustainability?: LocaleText
  /** Optional override of the auto-derived brandProductUrl. */
  brandProductUrl?: string
}

interface BrandSource {
  name: string
  slug: string
  countryOfOrigin?: string
  yearFounded?: number
  websiteUrl?: string
  sizingGuideUrl?: string
  featured?: boolean
  order?: number
  description?: LocaleText
  sizeChart?: CatalogBrand['sizeChart']
}

// ─── Helpers ──────────────────────────────────────────────────────────

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function shoeSlugToSku(slug: string): string {
  return slug
}

/**
 * Build one variant per (color × size with stock>0). When a shoe has multiple
 * colors, each color/size pair becomes a distinct variant.
 *
 * Variant SKU format:
 *   chamois-42            (single-color shoe)
 *   vibe-2-white-42       (multi-color shoe)
 */
function buildVariants(masterSku: string, shoe: ShoeSource): CatalogVariant[] {
  const stock = shoe.stock ?? {}
  const sizes = Object.keys(stock)
    .map((s) => parseInt(s, 10))
    .filter((s) => Number.isFinite(s))
    .sort((a, b) => a - b)

  const colors = shoe.colors && shoe.colors.length > 0
    ? shoe.colors
    : [{ name: { mk: '', en: '' } as LocaleString, hex: '#cccccc' }]

  const variants: CatalogVariant[] = []
  for (const color of colors) {
    for (const size of sizes) {
      const colorSuffix = colors.length > 1
        ? `-${(color.name.en ?? color.name.mk ?? 'x').toLowerCase().replace(/[^a-z0-9]/g, '')}`
        : ''
      variants.push({
        sizeEU: size,
        color: color.name.en || color.name.mk ? color.name : undefined,
        colorHex: color.hex,
        stock: stock[String(size)] ?? 0,
        sku: `${masterSku}${colorSuffix}-${size}`,
      })
    }
  }
  return variants
}

function buildBrand(src: BrandSource): CatalogBrand {
  return {
    slug: src.slug,
    name: src.name,
    countryOfOrigin: src.countryOfOrigin,
    yearFounded: src.yearFounded,
    websiteUrl: src.websiteUrl,
    sizingGuideUrl: src.sizingGuideUrl,
    featured: src.featured ?? false,
    order: src.order ?? 100,
    description: src.description,
    sizeChart: src.sizeChart,
  }
}

function buildProduct(slug: string, shoe: ShoeSource): CatalogProduct {
  const sku = shoeSlugToSku(slug)
  return {
    sku,
    brandSlug: BRAND_SLUG,
    categorySlugs: [],
    name: shoe.name,
    shortDescription: shoe.shortDescription,
    highlights: shoe.highlights ?? [],
    price: shoe.price,
    brandProductUrl: shoe.brandProductUrl,
    variants: buildVariants(sku, shoe),
    sizeAndFit: shoe.sizeAndFit,
    aboutShoe: shoe.aboutShoe,
    productInfo: shoe.productInfo,
    sustainability: shoe.sustainability,
    activities: (shoe.activities ?? []) as CatalogProduct['activities'],
    gender: shoe.gender ?? 'unisex',
    status: shoe.status ?? 'active',
  }
}

// ─── Catalog merge ────────────────────────────────────────────────────

function loadCatalog(): Catalog {
  return readJson<Catalog>(CATALOG_PATH)
}

function saveCatalog(cat: Catalog) {
  writeFileSync(CATALOG_PATH, JSON.stringify(cat, null, 2) + '\n', 'utf8')
}

// ─── Main ─────────────────────────────────────────────────────────────

function main() {
  const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`
  const green = (s: string) => `\x1b[32m${s}\x1b[0m`
  const dim = (s: string) => `\x1b[2m${s}\x1b[0m`
  const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`

  console.log(cyan('Freet extractor\n'))

  if (!existsSync(FREET_DIR)) {
    console.error(`Source folder not found: ${FREET_DIR}`)
    process.exit(1)
  }

  // Brand
  const brandPath = resolve(FREET_DIR, 'brand.json')
  if (!existsSync(brandPath)) {
    console.error(`Missing brand.json at ${brandPath}`)
    process.exit(1)
  }
  const brand = buildBrand(readJson<BrandSource>(brandPath))
  console.log(green(`  Brand: ${brand.name} (${brand.slug})`))

  // Shoes — each subdirectory with a shoe.json
  const shoeFolders = readdirSync(FREET_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  const products: CatalogProduct[] = []
  for (const slug of shoeFolders) {
    const shoePath = resolve(FREET_DIR, slug, 'shoe.json')
    if (!existsSync(shoePath)) {
      console.log(yellow(`  Skipping ${slug}: no shoe.json`))
      continue
    }
    const shoe = readJson<ShoeSource>(shoePath)
    const product = buildProduct(slug, shoe)
    products.push(product)
    const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
    console.log(
      green(`  + ${shoe.name.en ?? shoe.name.mk} (${product.sku})`) +
        dim(` — ${product.price} MKD, ${product.variants.length} variants, ${totalStock} units, status: ${product.status}`),
    )
  }

  if (products.length === 0) {
    console.error('No shoes found.')
    process.exit(1)
  }

  // Merge into catalog.json (replace any existing freet brand + products)
  const cat = loadCatalog()
  cat.brands = cat.brands.filter((b) => b.slug !== BRAND_SLUG).concat([brand])
  cat.brands.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
  cat.products = cat.products
    .filter((p) => p.brandSlug !== BRAND_SLUG)
    .concat(products)

  saveCatalog(cat)

  console.log()
  console.log(green(`Merged ${products.length} products into ${CATALOG_PATH}`))
  console.log(dim('Next: pnpm catalog (review) → pnpm catalog:apply (push)'))
  console.log()
}

main()
