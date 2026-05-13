# Copilot instructions — bosfoot

This file helps future Copilot sessions and contributors understand how to build, run, and make targeted changes in this repository.

## Quick commands (root workspace)
- Install: pnpm install
- Run admin (Sanity Studio): pnpm studio  (alias for: pnpm --filter studio dev)
- Build admin: pnpm studio:build
- Deploy admin: pnpm studio:deploy
- Run frontend (Astro): pnpm web  (alias for: pnpm --filter web dev)
- Build frontend: pnpm web:build
- Run both (dev parallel): pnpm dev
- Catalog importer (dry-run): pnpm catalog
- Catalog importer (apply): pnpm catalog:apply

Notes:
- No dedicated `test` or `lint` scripts at the root. Package-level type-check scripts exist:
  - apps/studio: npm script `type-check` → `tsc --noEmit`
  - apps/web: npm script `type-check` → `astro check`

To run a single package script directly:
- From repo root: pnpm --filter studio run type-check
- Or change directory and run: (cd apps/studio && pnpm run dev)

## Environment & prerequisites
- Node >= 20.19 (engines in package.json)
- pnpm@10+ (packageManager declared)
- Sanity account for Studio; apps/studio/.env holds SANITY_STUDIO_PROJECT_ID and SANITY_IMPORT_TOKEN used for catalog imports.

## High-level architecture
- Monorepo managed with pnpm workspaces (pnpm-workspace.yaml).
- apps/
  - studio/ — Sanity Studio v3: content admin, schema files at apps/studio/schemas. Run and edit here first.
  - web/ — Astro 5 frontend (React islands + Tailwind) (bootstrapped later).
- packages/shared/ — shared TypeScript types and utilities consumed by apps.
- scripts/ — utility/importer scripts (catalog importer reads data/catalog.json and data/images/).
- data/ — canonical product/catalog JSON and images used by the importer.

Data flow summary:
- Content is authored via Sanity Studio or updated programmatically via scripts/catalog which uses SKU and slug as stable keys. Dry-run mode reports changes before applying.
- Frontend (Astro) will query Sanity for published content when implemented.

## Key conventions and repository-specific patterns
- Translations: Most translatable fields are objects with `{ mk, sq, en }`. MK (Macedonian) is required. Slugs are per-language.
- Slug behavior: Macedonian Cyrillic is auto-transliterated to Latin for URL slugs.
- Stable keys for importer: SKU and slug are used to identify and update existing documents (avoid duplicate creates).
- Workspace scripts: Root package.json exposes convenient commands (pnpm studio, pnpm web, pnpm dev, pnpm catalog).
- Sanity edits: Adjust schemas in apps/studio/schemas/ — hot-reloads in development. Renaming fields requires a migration script; adding is safe.
- Type checks: Use package-specific `type-check` scripts before publishing or deploying (see apps/*/package.json).

## Where to look for common tasks
- Add a new schema or field: apps/studio/schemas/
- Run/import catalog changes: data/catalog.json, data/images/, then pnpm catalog / pnpm catalog:apply
- Deploy Studio: pnpm studio:deploy (uses Sanity deploy under apps/studio)

## Other AI/assistant configs discovered
- No CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, or similar assistant config files found in the repository root.

---

If any commands, scripts, or workspace packages are added later (tests, linters, CI), add them to this file so Copilot sessions can locate targeted commands quickly.
