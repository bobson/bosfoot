# Bosfoot

E-commerce platform for barefoot shoes, serving North Macedonia first, expanding across the Western Balkans.

## Stack

- **Frontend:** Astro 5 + React islands + Tailwind CSS v4 (in `apps/web`, not yet scaffolded)
- **Admin:** Sanity Studio v3 (in `apps/studio`)
- **Languages:** Macedonian (Cyrillic), Albanian, English
- **Payments:** Cash on delivery + bank transfer (v1), card via Monri (v2)
- **Shipping:** North Macedonia (v1), expandable via shipping zones

## Repository structure

```
bosfoot/
├── apps/
│   ├── studio/          ← Sanity admin (you'll run this first)
│   └── web/             ← Astro frontend (next phase)
├── packages/
│   └── shared/          ← shared TypeScript types
├── package.json         ← workspace root
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20.19+ or 22+ (`node --version`)
- pnpm 10+ (`pnpm --version`) — install with `npm install -g pnpm`
- A free Sanity account (sign up at sanity.io)

## First-time setup

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

This installs everything for both `studio` and `web` (when web exists) into a shared `node_modules` at the root.

### 2. Create your Sanity project

From the repo root:

```bash
cd apps/studio
npx sanity@latest init --env
```

This will:

- Open your browser for Sanity login
- Ask "Create new project or use existing?" → choose **Create new project**
- Project name: `Bosfoot` (or whatever you want)
- Use default dataset configuration: **Yes** (creates a `production` dataset, public)
- Project output path: just press Enter (we already have files)
- Write `.env` automatically with your project ID

After this, you should have a `.env` file in `apps/studio/` with `SANITY_STUDIO_PROJECT_ID=...` filled in.

### 3. Run the studio

From the repo root:

```bash
pnpm studio
```

This opens Sanity Studio at **http://localhost:3333**. Log in with the same Sanity account.

You should see the menu with: Site settings, Products, Brands, Categories, Orders, Shipping zones.

### 4. Create your first content

Suggested order to populate test data:

1. **Site settings** — fill in basic info, contact details, leave the rest blank for now
2. **Brand: Vivobarefoot** — name, slug, description (in 3 languages), country (GB), and the size chart from their official site
3. **Category: Running** — name and slug in 3 languages
4. **Shipping zone: North Macedonia** — countries `["MK"]`, base price 150, currency MKD, methods `cod` and `bankTransfer`, **active: true**
5. **Product: Vivobarefoot Primus Lite III** — pick the brand, add a few variants (sizes 39, 40, 41, 42 with 2 each in stock), set a price, add an image, set status to `active`

### 5. Deploy the studio (optional, when ready)

When you want a hosted admin URL like `bosfoot.sanity.studio`:

```bash
pnpm studio:deploy
```

Sanity hosts it free.

## Daily workflow

```bash
pnpm studio              # run admin on localhost:3333
pnpm web                 # run frontend on localhost:4321 (later)
pnpm dev                 # run both in parallel (later)
pnpm catalog              # dry-run the catalog importer
pnpm catalog:apply        # apply catalog changes to Sanity
```

## Catalog importer

Instead of clicking through the Studio for every product, you can manage the
catalog in `data/catalog.json` and import it via script.

**First-time setup:**

1. Generate a Sanity API token (used only by the import script):
   - Go to `https://www.sanity.io/manage/project/YOUR_PROJECT_ID/api/tokens`
   - Click "Add API token"
   - Name: `Import script`, Permissions: `Editor`
   - Copy the token

2. Add it to `apps/studio/.env`:

   ```
   SANITY_IMPORT_TOKEN=skXXXXXX...
   ```

3. Edit `data/catalog.json` with your products

4. Drop product images in `data/images/` named after SKUs (e.g. `XR-HFS2.jpg`)

**Run:**

```bash
pnpm catalog          # dry-run, shows what would change
pnpm catalog:apply    # writes to Sanity
```

The dry-run mode reports every create/update/unchanged/error so you can review
before applying. SKU and slug are used as stable keys — re-running updates
existing documents instead of creating duplicates.

See `data/README.md` for full details.

## Languages

All translatable fields are objects with `{ mk, sq, en }`. MK is required; SQ and EN can be filled later.

URL slugs are translated per language:

- `/mk/proizvodi/vivobarefoot-primus-lite-iii`
- `/sq/produktet/vivobarefoot-primus-lite-iii`
- `/en/products/vivobarefoot-primus-lite-iii`

Macedonian Cyrillic is auto-transliterated to Latin for slugs.

## Schema overview

| Type           | Purpose                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `product`      | A shoe — name, price, variants, specs, brand link                            |
| `brand`        | A maker — Vivobarefoot, Be Lenka, Xero, etc. Includes the brand's size chart |
| `category`     | Menu structure — Running, Hiking, Casual, Kids                               |
| `order`        | Customer purchases — snapshot of items at checkout time                      |
| `shippingZone` | Where you ship — toggle on/off as you expand                                 |
| `siteSettings` | Singleton — global config, hero, contact, etc.                               |

## Adjusting schemas

Edit any file in `apps/studio/schemas/`, save, and the studio hot-reloads. Adding fields is safe; removing fields hides them but keeps existing data; renaming a field needs a migration script.

## Next steps after studio is running

1. ✅ Schemas defined
2. ✅ Studio runs locally
3. ⏳ Bootstrap the Astro frontend (`apps/web`)
4. ⏳ Connect Astro to Sanity
5. ⏳ Build product listing & detail pages
6. ⏳ Build cart and checkout
7. ⏳ Set up hosting on Vercel
8. ⏳ Connect bosfoot.com domain
