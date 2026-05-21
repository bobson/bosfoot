import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * Deterministic Sanity document IDs.
 * We derive _id from the natural key (slug or SKU) so re-running the import
 * updates the same document instead of creating duplicates.
 *
 * IMPORTANT: We use `--` as separator, NOT `.`, because dots in _ids
 * conflict with Sanity's `path()` namespace matching used by perspective
 * filters. A document with `_id: product.xr-hfs2` can be incorrectly
 * filtered out by `perspective: 'published'`.
 */
export const ids = {
  brand: (slug: string) => `brand--${asciify(slug)}`,
  category: (slug: string) => `category--${asciify(slug)}`,
  product: (sku: string) => `product--${asciify(sku)}`,
};

function asciify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  if (label.split(".").some((p) => p.startsWith("_"))) return lines;
  if (deepEqual(before, after)) return lines;

  if (
    typeof before !== "object" ||
    typeof after !== "object" ||
    before === null ||
    after === null
  ) {
    lines.push(`    ${label}: ${stringify(before)} → ${stringify(after)}`);
    return lines;
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    const a = Array.isArray(before) ? before : [];
    const b = Array.isArray(after) ? after : [];
    if (a.length !== b.length) {
      lines.push(`    ${label}: ${a.length} → ${b.length} entries`);
    } else if (!deepEqual(a, b)) {
      lines.push(`    ${label}: contents changed`);
    }
    return lines;
  }

  const keys = new Set([
    ...Object.keys(before as Record<string, unknown>),
    ...Object.keys(after as Record<string, unknown>),
  ]);
  for (const key of keys) {
    diff(
      label === "" ? key : `${label}.${key}`,
      (before as Record<string, unknown>)[key],
      (after as Record<string, unknown>)[key],
      lines,
    );
  }
  return lines;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

function stringify(v: unknown): string {
  if (v === undefined) return "(unset)";
  return JSON.stringify(v);
}

/**
 * Build an index of every image file under data/images/ keyed by filename
 * stem (without extension). Result is cached after first call. Supports both
 * the flat layout (data/images/XR-HFS2.webp) and nested by brand/shoe
 * (data/images/freet/chamois/FR-CHAMOIS.webp). First match wins on collision.
 */
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
let _imageIndex: Map<string, string> | null = null;

function buildImageIndex(dataDir: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(dataDir)) return map;

  // Walk the entire data/ tree so brand sources can live anywhere under it
  // (e.g. data/freet/chamois/images/FR-CHAMOIS.webp). The legacy flat layout
  // at data/images/ also still works. node_modules is skipped if it exists.
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const dotIdx = entry.name.lastIndexOf(".");
        if (dotIdx < 0) continue;
        const stem = entry.name.slice(0, dotIdx);
        const ext = entry.name.slice(dotIdx + 1).toLowerCase();
        if (!IMAGE_EXTS.includes(ext)) continue;
        if (!map.has(stem)) map.set(stem, full);
      }
    }
  };
  walk(dataDir);
  return map;
}

function getImageIndex(dataDir: string): Map<string, string> {
  if (!_imageIndex) _imageIndex = buildImageIndex(dataDir);
  return _imageIndex;
}

/** Find an image whose filename matches {sku}.{ext} anywhere under data/images/. */
export function findProductImage(sku: string, dataDir: string): string | null {
  return getImageIndex(dataDir).get(sku) ?? null;
}

/** Find {sku}-1, {sku}-2, ... anywhere under data/images/, in order. */
export function findGalleryImages(sku: string, dataDir: string): string[] {
  const idx = getImageIndex(dataDir);
  const found: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const path = idx.get(`${sku}-${i}`);
    if (path) found.push(path);
  }
  return found;
}

export function readImageFile(path: string): Buffer {
  return readFileSync(path);
}
