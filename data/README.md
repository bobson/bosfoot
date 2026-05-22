# Catalog data

This folder holds the source-of-truth product data that gets imported into Sanity.

## Files

- `catalog.json` — the catalog: brands, categories, products, variants
- `{brand}/{slug}/images/` — product images named after the product slug
  (see below). Freet lives at `data/freet/{slug}/images/`.

## How imports work

Run from repo root:

```bash
pnpm catalog           # dry run — shows what would change, no writes
pnpm catalog:apply     # actually writes to Sanity
```

The script uses **SKU as a stable key**. Re-running updates existing documents
instead of creating duplicates. Safe to run repeatedly.

## Image conventions

Images are looked up by the product **slug** (derived from `name.en`,
falling back to `name.mk`). For Freet's "Vibe 2" the slug is `vibe-2`:

| File                                       | Purpose          |
| ------------------------------------------ | ---------------- |
| `freet/vibe-2/images/vibe-2.webp`          | Main image       |
| `freet/vibe-2/images/vibe-2-1.webp`        | Gallery image 1  |
| `freet/vibe-2/images/vibe-2-2.webp`        | Gallery image 2  |
| ... up to `-12`                            | up to 12 gallery |

The importer walks the whole `data/` tree and matches by filename stem, so
the directory layout is flexible — just keep stems unique.

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`. First match wins.

If no image is found for a product, it imports without a main image — you can
add one manually in the Sanity Studio. The script will print a warning.

## Translation workflow

The `description`, `name`, `shortDescription`, `color`, etc. fields are objects
with `mk`, `sq`, `en` keys. MK is required; the others are technically optional
(the script won't reject), but you should fill them in before going live.

```json
"name": {
  "mk": "Xero Shoes HFS II",
  "sq": "Xero Shoes HFS II",
  "en": "Xero Shoes HFS II"
}
```

Tip: prepare English copy first, run it through DeepL for SQ and MK first drafts,
then have native speakers review.

## Editing tips

- VS Code's JSON linter will catch syntax errors in real-time
- For bulk edits, you can use search-and-replace across the file
- Keep variants sorted by size for readability
- The `sku` field on a variant must be globally unique
- Don't change `slug` on brands/categories after products reference them, or
  use SKU on products after orders reference them — these are stable IDs

## Adding a new product

1. Find the brand entry, or add a new brand if needed
2. Add a new entry under `products` with all variants
3. Drop images into `{brand}/{slug}/images/` named after the product slug
   (e.g. `vibe-2.webp`, `vibe-2-1.webp`, ...)
4. Run `pnpm catalog` to preview, then `pnpm catalog:apply`
5. Set the product to `featured: true` if you want it on the homepage

## Adding a brand size chart

Each brand has its own size chart. Get the actual numbers from the brand's
official site — don't guess. Different brands use different conventions:

- Most brands publish "foot length" (your foot must be this long)
- Be Lenka publishes "insole length" (the shoe is this long inside)

Set `measurementType` accordingly.
