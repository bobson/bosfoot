import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Deterministic Sanity document IDs.
 * We derive _id from the natural key (slug or SKU) so re-running the import
 * updates the same document instead of creating duplicates.
 */
export const ids = {
  brand: (slug: string) => `brand.${asciify(slug)}`,
  category: (slug: string) => `category.${asciify(slug)}`,
  product: (sku: string) => `product.${asciify(sku)}`,
}

function asciify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Compare two values, return human-readable diff lines.
 * Skips Sanity-internal fields (those starting with _).
 */
export function diff(
  label: string,
  before: unknown,
  after: unknown,
  lines: string[] = [],
): string[] {
  if (label.split('.').some((p) => p.startsWith('_'))) return lines
  if (deepEqual(before, after)) return lines

  if (
    typeof before !== 'object' ||
    typeof after !== 'object' ||
    before === null ||
    after === null
  ) {
    lines.push(`    ${label}: ${stringify(before)} → ${stringify(after)}`)
    return lines
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : []
    const b = Array.isArray(after) ? after : []
    if (a.length !== b.length) {
      lines.push(`    ${label}: ${a.length} → ${b.length} entries`)
    } else if (!deepEqual(a, b)) {
      lines.push(`    ${label}: contents changed`)
    }
    return lines
  }

  const keys = new Set([
    ...Object.keys(before as Record<string, unknown>),
    ...Object.keys(after as Record<string, unknown>),
  ])
  for (const key of keys) {
    diff(
      label === '' ? key : `${label}.${key}`,
      (before as Record<string, unknown>)[key],
      (after as Record<string, unknown>)[key],
      lines,
    )
  }
  return lines
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (typeof a !== 'object') return false
  return JSON.stringify(a) === JSON.stringify(b)
}

function stringify(v: unknown): string {
  if (v === undefined) return '(unset)'
  return JSON.stringify(v)
}

/** Find data/images/{sku}.{ext}. Returns absolute path or null. */
export function findProductImage(sku: string, dataDir: string): string | null {
  const exts = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of exts) {
    const path = resolve(dataDir, 'images', `${sku}.${ext}`)
    if (existsSync(path)) return path
  }
  return null
}

/** Find data/images/{sku}-1.jpg, {sku}-2.jpg, etc. */
export function findGalleryImages(sku: string, dataDir: string): string[] {
  const found: string[] = []
  const exts = ['jpg', 'jpeg', 'png', 'webp']
  for (let i = 1; i <= 12; i++) {
    for (const ext of exts) {
      const path = resolve(dataDir, 'images', `${sku}-${i}.${ext}`)
      if (existsSync(path)) {
        found.push(path)
        break
      }
    }
  }
  return found
}

export function readImageFile(path: string): Buffer {
  return readFileSync(path)
}
