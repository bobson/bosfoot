# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root. All scripts are pnpm workspace aliases.

```bash
pnpm studio              # Sanity Studio on http://localhost:3333
pnpm web                 # Astro frontend on http://localhost:4321
pnpm dev                 # Run studio + web in parallel
pnpm catalog             # Dry-run catalog import (reads data/catalog.json + data/images/)
pnpm catalog:apply       # Apply catalog to Sanity
pnpm articles            # Dry-run article import
pnpm articles:apply      # Apply articles to Sanity
pnpm studio:deploy       # Deploy Sanity Studio to *.sanity.studio
pnpm web:build           # Build the Astro frontend
```

There are no test or lint scripts. Type-checking lives in each app:

```bash
pnpm --filter web run type-check       # astro check
pnpm --filter studio run type-check    # tsc --noEmit
```

Node `>=20.19`, pnpm `10+`. The `web` app is deployed via Vercel — see `apps/web/DEPLOY.md` for env vars and domain setup.

## Architecture

Three-tier monorepo (pnpm workspaces): **Sanity content backend → catalog importer → Astro/React storefront**.

### `apps/studio` — Sanity Studio v3

Content admin. `siteSettings` is a singleton enforced by the structure builder in `sanity.config.ts` (can't be duplicated or deleted). Schemas live under `schemas/documents/` (product, brand, category, article, order, shippingZone, siteSettings) and `schemas/objects/` (reusable types like `variant`, `sizeChart`, `localeString`/`localeText`/`localeSlug`, `productSpecs`).

### `apps/web` — Astro 5 + React islands + Tailwind v4

- **Rendering**: `output: "server"` with `@astrojs/vercel` adapter. Most pages are content-driven but use `export const prerender = false` where they need per-request server execution (checkout, order-confirmed, all `/api/*` routes).
- **Routing**: locale-prefixed under `src/pages/[lang]/...`. Root `/` redirects to `/mk/`. Three locales: `mk` (default, Cyrillic), `sq`, `en`. Helpers in `src/lib/i18n.ts` — URL path segments are English across all locales (e.g. `/sq/products`, not `/sq/produktet`).
- **Translatable fields**: any user-visible string from Sanity is shaped `{ mk?, sq?, en? }`. MK is required; others may be empty. Use `pickLocale(value, locale)` from `lib/i18n.ts` to read.
- **Two Sanity clients**: `lib/sanity.ts` (read-only, used everywhere) vs `lib/sanity-server.ts` (write client with `SANITY_WRITE_TOKEN`). The server client must NEVER be imported from any module reachable by a `client:*` component, or the token leaks into the browser bundle. Only `pages/api/*` and `prerender = false` pages may import it.
- **Cart state**: `lib/cart.ts` is plain TypeScript backed by `localStorage` and a `bosfoot:cart:v1` key. It bridges React islands and Astro components via DOM CustomEvents on `window`: dispatch `cart:add` / `cart:open`, listen for `cart:changed`. Don't reach for React Context or a state library — the existing event bus is intentional because the header (Astro) and drawer (React) need to share state.
- **UI primitives**: shadcn-style components under `src/components/ui/` (button, card, dialog, sheet, etc.). Astro components in `components/astro/`; React islands in `components/react/`. Both layers exist intentionally: Astro for static-render speed, React only where interactivity demands it (cart, checkout, image gallery, chat, search overlay, mobile nav).

### `scripts/` — catalog & article importers

`tsx`-executed Node scripts. SKU (products/variants) and slug (brands/categories/articles) are stable keys — re-running an import updates rather than duplicates. Always dry-run before applying. Reads `apps/studio/.env` for `SANITY_IMPORT_TOKEN`. Images for catalog imports are matched by SKU under `data/images/` — see `data/README.md`.

### `data/` — source-of-truth product JSON

Editing `data/catalog.json` and running `pnpm catalog:apply` is the preferred way to manage the catalog (vs. clicking through Studio). Brand size charts include `measurementType: "footLengthMM" | "insoleLengthMM"` — most brands publish foot length, Be Lenka publishes insole length. The chat agent uses this to do sizing recommendations correctly.

## Cross-cutting things to know

- **Chat agent** (`apps/web/src/pages/api/chat.ts` + `lib/chat-context.ts`): server-side SSE endpoint backed by Claude Haiku 4.5. The system prompt is assembled from per-brand size charts + the editable `siteSettings.chatFaq` blob, memoized at module scope for 5 minutes. The widget is mounted globally in `BaseLayout.astro` as a `client:idle` island. Defences: same-origin check, per-IP in-memory rate limit (resets on cold start), strict message-shape validation.

- **Astro + Vercel quirk**: in API routes deployed on Vercel, `url.host` (from the `APIRoute` context) returns `"localhost"` rather than the public hostname. The Vercel adapter doesn't forward the real Host. For same-origin or host-allowlist checks, derive the canonical host from `import.meta.env.SITE` (set by `astro.config.mjs`'s `site` field), plus allowlists for `*.vercel.app` (previews) and `localhost` (dev). See `pages/api/chat.ts` for the pattern.

- **Schema changes**: adding fields in `apps/studio/schemas/` is safe and hot-reloads. Removing fields hides them but keeps data. Renaming requires a migration script — don't rename `sku` on variants or `slug` on brands/categories once products/orders reference them.

- **Price display**: prices are MKD-primary with EUR shown stacked below. Use the `<Price>` (React) or `Price.astro` components, not the raw `formatPrice` helper — these handle the bilingual layout consistently.
