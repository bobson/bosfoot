/**
 * Bosfoot catalog importer.
 *
 * Usage:
 *   pnpm catalog           Dry run — print what would happen, no writes
 *   pnpm catalog:apply   Apply changes to Sanity
 *
 * Reads data/catalog.json. Looks for product images at data/images/{sku}.{ext}.
 * Uses SKU and slug as natural keys — re-running updates existing documents.
 */

import { readFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

import { client, sanityProjectInfo } from './sanity.js'
import {
  ids,
  diff,
  findProductImage,
  findGalleryImages,
  readImageFile,
} from './helpers.js'
import type {
  Catalog,
  CatalogBrand,
  CatalogCategory,
  CatalogProduct,
} from './types.js'

// ─── Setup ────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(REPO_ROOT, 'data')
const CATALOG_PATH = resolve(DATA_DIR, 'catalog.json')

const APPLY = process.argv.includes('--apply')

// Color codes for terminal output (ANSI)
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

// ─── Plan structure ───────────────────────────────────────────────────
type PlanItem =
  | { kind: 'create'; type: string; label: string; doc: SanityDoc; imagePath?: string | null; galleryPaths?: string[] }
  | { kind: 'update'; type: string; label: string; doc: SanityDoc; diffLines: string[]; imagePath?: string | null; galleryPaths?: string[] }
  | { kind: 'unchanged'; type: string; label: string }
  | { kind: 'error'; type: string; label: string; message: string }

type SanityDoc = Record<string, unknown> & { _id: string; _type: string }

// ─── Build Sanity documents from catalog entries ──────────────────────
function buildBrandDoc(b: CatalogBrand): SanityDoc {
  return {
    _id: ids.brand(b.slug),
    _type: 'brand',
    name: b.name,
    slug: { _type: 'slug', current: b.slug },
    countryOfOrigin: b.countryOfOrigin,
    yearFounded: b.yearFounded,
    websiteUrl: b.websiteUrl,
    sizingGuideUrl: b.sizingGuideUrl,
    description: b.description ? { _type: 'localeText', ...b.description } : undefined,
    sizeChart: b.sizeChart
      ? {
        _type: 'sizeChart',
        measurementType: b.sizeChart.measurementType,
        rows: b.sizeChart.rows.map((row, i) => ({
          _type: 'sizeChartRow',
          _key: `row-${i}`,
          sizeEU: row.sizeEU,
          lengthMM: row.lengthMM,
        })),
        notes: b.sizeChart.notes ? { _type: 'localeText', ...b.sizeChart.notes } : undefined,
      }
      : undefined,
    featured: b.featured ?? false,
    order: b.order ?? 100,
  }
}

function buildCategoryDoc(c: CatalogCategory): SanityDoc {
  return {
    _id: ids.category(c.slug),
    _type: 'category',
    name: { _type: 'localeString', ...c.name },
    slug: {
      _type: 'localeSlug',
      mk: { _type: 'slug', current: asciifySlug(c.name.mk) },
      sq: c.name.sq ? { _type: 'slug', current: asciifySlug(c.name.sq) } : undefined,
      en: c.name.en ? { _type: 'slug', current: asciifySlug(c.name.en) } : undefined,
    },
    description: c.description ? { _type: 'localeText', ...c.description } : undefined,
    order: c.order ?? 100,
    parent: c.parentSlug ? { _type: 'reference', _ref: ids.category(c.parentSlug) } : undefined,
  }
}

function buildProductDoc(p: CatalogProduct): SanityDoc {
  return {
    _id: ids.product(p.sku),
    _type: 'product',
    sku: p.sku,
    name: { _type: 'localeString', ...p.name },
    slug: {
      _type: 'localeSlug',
      mk: { _type: 'slug', current: asciifySlug(p.name.mk) },
      sq: p.name.sq ? { _type: 'slug', current: asciifySlug(p.name.sq) } : undefined,
      en: p.name.en ? { _type: 'slug', current: asciifySlug(p.name.en) } : undefined,
    },
    brand: { _type: 'reference', _ref: ids.brand(p.brandSlug) },
    categories: (p.categorySlugs ?? []).map((slug, i) => ({
      _type: 'reference',
      _key: `cat-${i}`,
      _ref: ids.category(slug),
    })),
    shortDescription: p.shortDescription
      ? { _type: 'localeText', ...p.shortDescription }
      : undefined,
    highlights: (p.highlights ?? []).map((h, i) => ({
      _type: 'localeString',
      _key: `h-${i}`,
      ...h,
    })),
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    costPrice: p.costPrice,
    taxIncluded: true,
    brandProductUrl: p.brandProductUrl,
    variants: p.variants.map((v) => ({
      _type: 'variant',
      _key: v.sku,
      sizeEU: v.sizeEU,
      color: v.color ? { _type: 'localeString', ...v.color } : undefined,
      colorHex: v.colorHex,
      stock: v.stock,
      sku: v.sku,
    })),
    specs: p.specs
      ? {
        _type: 'productSpecs',
        ...p.specs,
        upperMaterial: p.specs.upperMaterial
          ? { _type: 'localeString', ...p.specs.upperMaterial }
          : undefined,
        soleMaterial: p.specs.soleMaterial
          ? { _type: 'localeString', ...p.specs.soleMaterial }
          : undefined,
        lining: p.specs.lining ? { _type: 'localeString', ...p.specs.lining } : undefined,
        sizingNotes: p.specs.sizingNotes
          ? { _type: 'localeText', ...p.specs.sizingNotes }
          : undefined,
        additionalFeatures: p.specs.additionalFeatures
          ? p.specs.additionalFeatures.map((f, i) => ({
            _type: 'localeString',
            _key: `feat-${i}`,
            ...f,
          }))
          : undefined,
      }
      : undefined,
    activities: p.activities ?? [],
    gender: p.gender ?? 'unisex',
    status: p.status ?? 'active',
    featured: p.featured ?? false,
    newArrival: p.newArrival ?? false,
    publishedAt: new Date().toISOString(),
  }
}

// Cyrillic-aware slugifier matching the studio's logic
const cyrillicMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ѓ: 'gj', е: 'e', ж: 'zh',
  з: 'z', ѕ: 'dz', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm',
  н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ќ: 'kj',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', џ: 'dj', ш: 'sh',
}

function asciifySlug(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((ch) => cyrillicMap[ch] ?? ch)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96)
}

// ─── Validation ───────────────────────────────────────────────────────
function validate(catalog: Catalog): string[] {
  const errors: string[] = []

  const brandSlugs = new Set(catalog.brands.map((b) => b.slug))
  const categorySlugs = new Set(catalog.categories.map((c) => c.slug))
  const productSkus = new Set<string>()
  const variantSkus = new Set<string>()

  for (const b of catalog.brands) {
    if (!b.slug) errors.push(`Brand missing slug: ${b.name}`)
    if (!b.name) errors.push(`Brand ${b.slug} missing name`)
  }

  for (const c of catalog.categories) {
    if (!c.slug) errors.push(`Category missing slug`)
    if (!c.name?.mk) errors.push(`Category ${c.slug} missing Macedonian name`)
    if (c.parentSlug && !categorySlugs.has(c.parentSlug)) {
      errors.push(`Category ${c.slug} references unknown parent: ${c.parentSlug}`)
    }
  }

  for (const p of catalog.products) {
    if (!p.sku) {
      errors.push(`Product missing SKU: ${p.name?.mk ?? '(no name)'}`)
      continue
    }
    if (productSkus.has(p.sku)) {
      errors.push(`Duplicate product SKU: ${p.sku}`)
    }
    productSkus.add(p.sku)

    if (!p.name?.mk) errors.push(`Product ${p.sku} missing Macedonian name`)
    if (typeof p.price !== 'number' || p.price < 0) {
      errors.push(`Product ${p.sku} has invalid price: ${p.price}`)
    }
    if (!brandSlugs.has(p.brandSlug)) {
      errors.push(`Product ${p.sku} references unknown brand: ${p.brandSlug}`)
    }
    for (const slug of p.categorySlugs ?? []) {
      if (!categorySlugs.has(slug)) {
        errors.push(`Product ${p.sku} references unknown category: ${slug}`)
      }
    }
    if (!p.variants?.length) {
      errors.push(`Product ${p.sku} has no variants`)
    }
    for (const v of p.variants ?? []) {
      if (!v.sku) {
        errors.push(`Variant in ${p.sku} missing SKU`)
        continue
      }
      if (variantSkus.has(v.sku)) {
        errors.push(`Duplicate variant SKU: ${v.sku}`)
      }
      variantSkus.add(v.sku)
      if (typeof v.stock !== 'number' || v.stock < 0) {
        errors.push(`Variant ${v.sku} has invalid stock: ${v.stock}`)
      }
    }
  }

  return errors
}

// ─── Build the plan: what would happen on apply ───────────────────────
async function buildPlan(catalog: Catalog): Promise<PlanItem[]> {
  const plan: PlanItem[] = []

  // Fetch existing docs in one go
  const allIds = [
    ...catalog.brands.map((b) => ids.brand(b.slug)),
    ...catalog.categories.map((c) => ids.category(c.slug)),
    ...catalog.products.map((p) => ids.product(p.sku)),
  ]

  const existingArr = await client.fetch<SanityDoc[]>(
    `*[_id in $ids]`,
    { ids: allIds },
  )
  const existing = new Map(existingArr.map((d) => [d._id, d]))

  // Brands
  for (const b of catalog.brands) {
    const newDoc = buildBrandDoc(b)
    plan.push(...diffOrCreate('brand', b.name, newDoc, existing.get(newDoc._id)))
  }

  // Categories
  for (const cat of catalog.categories) {
    const newDoc = buildCategoryDoc(cat)
    plan.push(
      ...diffOrCreate('category', cat.name.mk, newDoc, existing.get(newDoc._id)),
    )
  }

  // Products
  for (const p of catalog.products) {
    const newDoc = buildProductDoc(p)
    const existingDoc = existing.get(newDoc._id)

    const imagePath = findProductImage(p.sku, DATA_DIR)
    const galleryPaths = findGalleryImages(p.sku, DATA_DIR)

    if (!existingDoc) {
      plan.push({
        kind: 'create',
        type: 'product',
        label: `${p.name.mk} (${p.sku})`,
        doc: newDoc,
        imagePath,
        galleryPaths,
      })
    } else {
      const diffLines = diffDocs(existingDoc, newDoc)
      if (diffLines.length === 0) {
        plan.push({
          kind: 'unchanged',
          type: 'product',
          label: `${p.name.mk} (${p.sku})`,
        })
      } else {
        plan.push({
          kind: 'update',
          type: 'product',
          label: `${p.name.mk} (${p.sku})`,
          doc: newDoc,
          diffLines,
          imagePath,
          galleryPaths,
        })
      }
    }
  }

  return plan
}

function diffOrCreate(
  type: string,
  label: string,
  newDoc: SanityDoc,
  existingDoc?: SanityDoc,
): PlanItem[] {
  if (!existingDoc) {
    return [{ kind: 'create', type, label, doc: newDoc }]
  }
  const diffLines = diffDocs(existingDoc, newDoc)
  if (diffLines.length === 0) {
    return [{ kind: 'unchanged', type, label }]
  }
  return [{ kind: 'update', type, label, doc: newDoc, diffLines }]
}

function diffDocs(existing: SanityDoc, next: SanityDoc): string[] {
  // Strip Sanity-internal fields and "undefined" values from next before comparing
  const cleanNext = stripUndefined(next)
  const cleanExisting = stripInternal(existing)
  return diff('', cleanExisting, cleanNext)
}

function stripUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripUndefined)
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = stripUndefined(v)
    }
    return out
  }
  return obj
}

function stripInternal(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripInternal)
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('_') && k !== '_type' && k !== '_ref' && k !== '_key') continue
      out[k] = stripInternal(v)
    }
    return out
  }
  return obj
}

// ─── Print the dry-run report ─────────────────────────────────────────
function printPlan(plan: PlanItem[]) {
  const groups = {
    brand: plan.filter((p) => p.type === 'brand'),
    category: plan.filter((p) => p.type === 'category'),
    product: plan.filter((p) => p.type === 'product'),
  }

  console.log()
  console.log(c.bold + 'Bosfoot Import — ' + (APPLY ? c.green + 'APPLY' : c.yellow + 'DRY RUN') + c.reset)
  console.log(c.dim + `Project: ${sanityProjectInfo.projectId} / ${sanityProjectInfo.dataset}` + c.reset)
  console.log()

  for (const [type, items] of Object.entries(groups)) {
    if (items.length === 0) continue
    console.log(c.bold + type.toUpperCase() + 'S' + c.reset)
    for (const item of items) {
      printPlanItem(item)
    }
    console.log()
  }

  // Summary
  const create = plan.filter((p) => p.kind === 'create').length
  const update = plan.filter((p) => p.kind === 'update').length
  const unchanged = plan.filter((p) => p.kind === 'unchanged').length
  const errors = plan.filter((p) => p.kind === 'error').length
  const missingImages = plan.filter(
    (p) => (p.kind === 'create' || p.kind === 'update') && p.type === 'product' && !p.imagePath,
  ).length

  console.log(c.bold + 'SUMMARY' + c.reset)
  console.log(`  Create:    ${c.green}${create}${c.reset}`)
  console.log(`  Update:    ${c.cyan}${update}${c.reset}`)
  console.log(`  Unchanged: ${c.dim}${unchanged}${c.reset}`)
  if (errors > 0) console.log(`  Errors:    ${c.red}${errors}${c.reset}`)
  if (missingImages > 0) {
    console.log(`  ${c.yellow}Products without main image: ${missingImages}${c.reset}`)
  }
  console.log()

  if (!APPLY && (create > 0 || update > 0)) {
    console.log(c.dim + 'To apply these changes:' + c.reset)
    console.log('  pnpm catalog:apply')
    console.log()
  }
}

function printPlanItem(item: PlanItem) {
  switch (item.kind) {
    case 'create':
      console.log(`  ${c.green}+ Create:${c.reset} ${item.label}`)
      if (item.type === 'product') {
        const imgInfo =
          item.imagePath != null
            ? `${c.dim}image ✓${c.reset}`
            : `${c.yellow}image not found${c.reset}`
        const galleryInfo =
          item.galleryPaths && item.galleryPaths.length > 0
            ? `${c.dim} + ${item.galleryPaths.length} gallery${c.reset}`
            : ''
        console.log(`            ${imgInfo}${galleryInfo}`)
      }
      break
    case 'update':
      console.log(`  ${c.cyan}~ Update:${c.reset} ${item.label}`)
      for (const line of item.diffLines.slice(0, 8)) {
        console.log(c.dim + line + c.reset)
      }
      if (item.diffLines.length > 8) {
        console.log(c.dim + `    ... and ${item.diffLines.length - 8} more changes` + c.reset)
      }
      break
    case 'unchanged':
      console.log(`  ${c.dim}= Unchanged: ${item.label}${c.reset}`)
      break
    case 'error':
      console.log(`  ${c.red}✗ Error: ${item.label}${c.reset}`)
      console.log(`      ${item.message}`)
      break
  }
}

// ─── Apply phase: actually write to Sanity ────────────────────────────
async function applyPlan(plan: PlanItem[]) {
  const writes = plan.filter((p) => p.kind === 'create' || p.kind === 'update')
  if (writes.length === 0) {
    console.log(c.dim + 'Nothing to apply.' + c.reset)
    return
  }

  console.log(c.bold + `Applying ${writes.length} changes...` + c.reset)
  console.log()

  // Phase 1: upload images (must happen before docs reference them)
  type ImageMap = { main?: { _ref: string }; gallery: Array<{ _key: string; _ref: string }> }
  const productImages = new Map<string, ImageMap>()

  for (const item of writes) {
    if (item.type !== 'product') continue

    const imageMap: ImageMap = { gallery: [] }

    if (item.imagePath) {
      process.stdout.write(`  Uploading ${basename(item.imagePath)}... `)
      try {
        const asset = await client.assets.upload('image', readImageFile(item.imagePath), {
          filename: basename(item.imagePath),
        })
        imageMap.main = { _ref: asset._id }
        console.log(c.green + 'ok' + c.reset)
      } catch (err) {
        console.log(c.red + 'failed' + c.reset)
        console.error('   ', (err as Error).message)
      }
    }

    if (item.galleryPaths) {
      for (let i = 0; i < item.galleryPaths.length; i++) {
        const path = item.galleryPaths[i]
        process.stdout.write(`  Uploading ${basename(path)}... `)
        try {
          const asset = await client.assets.upload('image', readImageFile(path), {
            filename: basename(path),
          })
          imageMap.gallery.push({ _key: `gallery-${i}`, _ref: asset._id })
          console.log(c.green + 'ok' + c.reset)
        } catch (err) {
          console.log(c.red + 'failed' + c.reset)
          console.error('   ', (err as Error).message)
        }
      }
    }

    productImages.set(item.doc._id, imageMap)
  }

  // Phase 2: write documents in a single transaction
  const tx = client.transaction()

  for (const item of writes) {
    const doc = { ...item.doc }

    if (item.type === 'product') {
      const imgs = productImages.get(doc._id)
      if (imgs?.main) {
        doc.mainImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: imgs.main._ref },
        }
      }
      if (imgs && imgs.gallery.length > 0) {
        doc.gallery = imgs.gallery.map((g) => ({
          _type: 'image',
          _key: g._key,
          asset: { _type: 'reference', _ref: g._ref },
        }))
      }
    }

    tx.createOrReplace(doc as SanityDoc)
  }

  console.log(c.dim + '\n  Committing transaction...' + c.reset)
  await tx.commit()
  console.log(c.green + c.bold + '\n✓ Done.' + c.reset)
  console.log()
  console.log(c.dim + `View at https://${sanityProjectInfo.projectId}.sanity.studio` + c.reset)
  console.log(c.dim + 'or http://localhost:3333 if studio is running.' + c.reset)
  console.log()
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log(c.dim + `Reading ${CATALOG_PATH}` + c.reset)

  let catalog: Catalog
  try {
    const raw = readFileSync(CATALOG_PATH, 'utf8')
    catalog = JSON.parse(raw) as Catalog
  } catch (err) {
    console.error(c.red + 'Failed to read catalog.json:' + c.reset, (err as Error).message)
    process.exit(1)
  }

  // Validate
  const errors = validate(catalog)
  if (errors.length > 0) {
    console.error()
    console.error(c.red + c.bold + 'Validation errors:' + c.reset)
    for (const e of errors) console.error(`  ${c.red}✗${c.reset} ${e}`)
    console.error()
    process.exit(1)
  }

  // Build plan
  const plan = await buildPlan(catalog)
  printPlan(plan)

  if (APPLY) {
    await applyPlan(plan)
  }
}

main().catch((err) => {
  console.error(c.red + 'Import failed:' + c.reset, err)
  process.exit(1)
})