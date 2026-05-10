/**
 * Product filter & sort logic.
 *
 * Pure functions — no React, no DOM. This makes the logic easy to reason about
 * and lets the filter run on either server or client without changes.
 *
 * The filter UI builds a `FilterState` object, applies it via `applyFilters`,
 * and uses `computeFacets` to know which options would yield zero results
 * (so they can be disabled).
 */

import type { ProductCard } from './queries'
import { totalStock } from './queries'

export type SortOrder = 'newest' | 'price-asc' | 'price-desc'

export type Activity =
  | 'running'
  | 'hiking'
  | 'casual'
  | 'training'
  | 'water'
  | 'winter'
  | 'office'
  | 'kids'

export type Gender = 'mens' | 'womens' | 'unisex' | 'kids'

export type FilterState = {
  brands: string[] // brand slugs
  sizes: number[] // EU sizes
  activities: Activity[] // running, hiking, casual, etc.
  genders: Gender[] // mens, womens, unisex, kids
  inStock: boolean // hide out-of-stock if true
  sort: SortOrder
}

export const EMPTY_FILTERS: FilterState = {
  brands: [],
  sizes: [],
  activities: [],
  genders: [],
  inStock: false,
  sort: 'newest',
}

/**
 * Apply a filter state to a product list.
 * Multiple filters within a facet are OR-ed (e.g. brand: Xero OR Vivobarefoot)
 * Different facets are AND-ed (e.g. brand AND size).
 */
export function applyFilters(
  products: ProductCard[],
  filters: FilterState,
): ProductCard[] {
  let out = products

  if (filters.brands.length > 0) {
    out = out.filter((p) => filters.brands.includes(p.brand?.slug.current))
  }

  if (filters.sizes.length > 0) {
    out = out.filter((p) =>
      p.variants.some(
        (v) =>
          filters.sizes.includes((v as VariantWithSize).sizeEU ?? -1) &&
          (v.stock ?? 0) > 0,
      ),
    )
  }

  if (filters.activities.length > 0) {
    out = out.filter((p) =>
      (p.activities ?? []).some((a) =>
        filters.activities.includes(a as Activity),
      ),
    )
  }

  if (filters.genders.length > 0) {
    out = out.filter((p) =>
      p.gender ? filters.genders.includes(p.gender as Gender) : false,
    )
  }

  if (filters.inStock) {
    out = out.filter((p) => totalStock(p) > 0)
  }

  // Sort
  switch (filters.sort) {
    case 'price-asc':
      out = [...out].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      out = [...out].sort((a, b) => b.price - a.price)
      break
    case 'newest':
    default:
      // Already sorted newest-first by the GROQ query
      break
  }

  return out
}

/**
 * Helper type — variants in our ProductCard query include sizeEU but the
 * type isn't widened to it. We add it where needed.
 */
type VariantWithSize = ProductCard['variants'][number] & { sizeEU?: number }

/**
 * For each filter facet, compute which option values would still return at
 * least one product if added to the current filter state.
 *
 * The standard rule: when computing facets for a given facet, EXCLUDE that
 * facet from the current filters. Otherwise, once a user clicks one brand,
 * all OTHER brands become disabled — which is wrong UX.
 */
export type Facets = {
  brands: Set<string> // brand slugs that have ≥1 matching product
  sizes: Set<number> // EU sizes that have ≥1 matching product
  activities: Set<Activity> // activities that have ≥1 matching product
  genders: Set<Gender> // genders that have ≥1 matching product
}

export function computeFacets(
  allProducts: ProductCard[],
  filters: FilterState,
): Facets {
  const brands = new Set<string>()
  const sizes = new Set<number>()
  const activities = new Set<Activity>()
  const genders = new Set<Gender>()

  // Brands: filter by everything EXCEPT brands
  const productsForBrandFacet = applyFilters(allProducts, {
    ...filters,
    brands: [],
  })
  for (const p of productsForBrandFacet) {
    if (p.brand?.slug.current) brands.add(p.brand.slug.current)
  }

  // Sizes: filter by everything EXCEPT sizes
  const productsForSizeFacet = applyFilters(allProducts, {
    ...filters,
    sizes: [],
  })
  for (const p of productsForSizeFacet) {
    for (const v of p.variants) {
      const sz = (v as VariantWithSize).sizeEU
      if (typeof sz === 'number' && (v.stock ?? 0) > 0) {
        sizes.add(sz)
      }
    }
  }

  // Activities: filter by everything EXCEPT activities
  const productsForActivityFacet = applyFilters(allProducts, {
    ...filters,
    activities: [],
  })
  for (const p of productsForActivityFacet) {
    for (const a of p.activities ?? []) {
      activities.add(a as Activity)
    }
  }

  // Genders: filter by everything EXCEPT genders
  const productsForGenderFacet = applyFilters(allProducts, {
    ...filters,
    genders: [],
  })
  for (const p of productsForGenderFacet) {
    if (p.gender) genders.add(p.gender as Gender)
  }

  return { brands, sizes, activities, genders }
}

/**
 * Extract all unique brand slugs and EU sizes from a product list.
 * Used to build the FULL list of filter options (some of which may be disabled).
 */
export function extractFilterOptions(products: ProductCard[]): {
  brands: Array<{ slug: string; name: string }>
  sizes: number[]
  activities: Activity[]
  genders: Gender[]
} {
  const brandMap = new Map<string, string>()
  const sizes = new Set<number>()
  const activities = new Set<Activity>()
  const genders = new Set<Gender>()

  for (const p of products) {
    if (p.brand?.slug.current && p.brand.name) {
      brandMap.set(p.brand.slug.current, p.brand.name)
    }
    for (const v of p.variants) {
      const sz = (v as VariantWithSize).sizeEU
      if (typeof sz === 'number') sizes.add(sz)
    }
    for (const a of p.activities ?? []) {
      activities.add(a as Activity)
    }
    if (p.gender) genders.add(p.gender as Gender)
  }

  // Stable order for activities
  const ACTIVITY_ORDER: Activity[] = [
    'running', 'hiking', 'training', 'casual', 'office', 'water', 'winter', 'kids',
  ]
  const sortedActivities = ACTIVITY_ORDER.filter((a) => activities.has(a))

  // Stable order for genders
  const GENDER_ORDER: Gender[] = ['mens', 'womens', 'unisex', 'kids']
  const sortedGenders = GENDER_ORDER.filter((g) => genders.has(g))

  return {
    brands: [...brandMap.entries()]
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    sizes: [...sizes].sort((a, b) => a - b),
    activities: sortedActivities,
    genders: sortedGenders,
  }
}

/* ─────────────────────────────────────────────────────────────────────
   URL <-> FilterState serialization
   We use URLSearchParams so filters are shareable/bookmarkable.
   ───────────────────────────────────────────────────────────────────── */

export function filtersToParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.brands.length) params.set('brand', state.brands.join(','))
  if (state.sizes.length) params.set('size', state.sizes.join(','))
  if (state.activities.length) params.set('activity', state.activities.join(','))
  if (state.genders.length) params.set('gender', state.genders.join(','))
  if (state.inStock) params.set('stock', '1')
  if (state.sort !== 'newest') params.set('sort', state.sort)
  return params
}

export function paramsToFilters(params: URLSearchParams): FilterState {
  const brands = params.get('brand')?.split(',').filter(Boolean) ?? []
  const sizes =
    params
      .get('size')
      ?.split(',')
      .map(Number)
      .filter((n) => !Number.isNaN(n)) ?? []
  const activities =
    (params.get('activity')?.split(',').filter(Boolean) ?? []) as Activity[]
  const genders =
    (params.get('gender')?.split(',').filter(Boolean) ?? []) as Gender[]
  const inStock = params.get('stock') === '1'
  const sort = (params.get('sort') as SortOrder) || 'newest'
  return { brands, sizes, activities, genders, inStock, sort }
}