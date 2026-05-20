# Deploying Bosfoot to Vercel

Step-by-step guide for first-time deployment.

## Prerequisites

- [ ] Code pushed to GitHub (the whole monorepo)
- [ ] Sanity project working locally (`pnpm studio` runs cleanly)
- [ ] Web app builds locally (`pnpm --filter web build` succeeds)
- [ ] Sanity write token generated and added to local `.env`

## Phase 1: Test the production build locally

Before deploying, make sure the build actually works.

```bash
cd ~/Projects/bosfoot
pnpm --filter web build
```

The build should complete without errors. Output goes to `apps/web/dist/`.

If you see TypeScript errors, fix them first — Vercel will run the same build
and fail on the same errors.

Preview the production build locally:

Note: The `@astrojs/vercel` adapter disables the built-in `astro preview` command. If you run `pnpm --filter web preview` and see an error like "The @astrojs/vercel adapter does not support the preview command", use one of the alternatives below.

- Quick dev check (fast, not identical to production):

```bash
pnpm --filter web dev
```

- Serve the static build locally (recommended for most checks):

```bash
pnpm --filter web build
# Serve the built client folder (open the localized path like /mk/ or /en/)
# Use -s for SPA fallback, and specify a port if you like:
npx serve -s apps/web/dist/client -l 3000
```

(Or add `serve` as a dev dependency: `pnpm --filter web add -D serve` and then run `npx serve -s apps/web/dist/client -l 3000`.)

- If you need `astro preview` specifically (server preview), use a different adapter such as `@astrojs/node` that supports `astro preview`, or push to Vercel and use a preview deployment (branches get their own preview URLs).

Walk through homepage → product detail → cart → checkout to confirm everything still works as a production build.

## Phase 2: Push to GitHub

If the repo isn't on GitHub yet:

```bash
# In the project root
git init
git add .
git commit -m "Initial commit"

# Create a new private repo on github.com, then:
git remote add origin git@github.com:YOUR_USERNAME/bosfoot.git
git branch -M main
git push -u origin main
```

If it's already on GitHub, just push your latest commits:

```bash
git push
```

## Phase 3: Create the Vercel project

1. Go to https://vercel.com and log in (with GitHub for easiest connection)
2. Click **Add New → Project**
3. Click **Import** next to your `bosfoot` repository
4. Vercel detects it's a monorepo and asks which app to deploy

### Configure the project

| Setting | Value |
|---|---|
| Framework Preset | Astro |
| Root Directory | `apps/web` |
| Build Command | `pnpm --filter web build` |
| Output Directory | (auto-detected by Astro Vercel adapter) |
| Install Command | `pnpm install` |

### Environment variables

Click **Environment Variables** and add four:

| Name | Value | Environment |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | `s0p60sp0` | All |
| `PUBLIC_SANITY_DATASET` | `production` | All |
| `SANITY_WRITE_TOKEN` | (paste the token you generated) | All |
| `ANTHROPIC_API_KEY` | (from Anthropic Console — see below) | All |

The first two are public — safe to commit (they're already in your client-side
code as `import.meta.env.PUBLIC_*`). The Sanity write token and Anthropic API key
are server-only — never put either in a `PUBLIC_` env var.

**Getting the Anthropic API key:** visit https://console.anthropic.com/settings/keys
→ **Create Key**. Billing and usage live at
https://console.anthropic.com/settings/billing. The key powers `/api/chat`, the
customer-support chat widget mounted in `BaseLayout` (Claude Haiku 4.5).

Click **Deploy**. First build takes 2-4 minutes.

## Phase 4: Verify

Once deployed, Vercel gives you a URL like `bosfoot-xyz.vercel.app`.

Walk through:

- [ ] Homepage loads at `/` (redirects to `/mk/`)
- [ ] Products listing at `/mk/products` shows your products
- [ ] Click into a product — image gallery + buy panel render
- [ ] Add to cart → drawer opens
- [ ] Checkout form submits → order created in Sanity (check Studio)
- [ ] Order confirmation page loads with order details
- [ ] Open Sanity Studio (localhost still) → order appears under Orders

If any of these fail, check the Vercel deployment logs in the dashboard.

## Phase 5: Connect bosfoot.com

In your Vercel project:

1. **Settings** → **Domains**
2. Click **Add**
3. Enter `bosfoot.com`
4. Vercel shows you DNS records to add

In your domain registrar (where you bought bosfoot.com):

5. Open DNS management for the domain
6. Add the records Vercel showed you (typically an A record + a CNAME for www)
7. Wait 5-60 minutes for DNS propagation

Vercel will auto-issue an HTTPS certificate via Let's Encrypt once DNS resolves.

## Phase 6: Update Sanity CORS

Now that the site is live, Sanity needs to allow the production domain too:

1. Go to https://www.sanity.io/manage/project/s0p60sp0/api
2. **CORS Origins** → **Add CORS origin**
3. Origin: `https://bosfoot.com`
4. Origin: `https://www.bosfoot.com` (add separately)
5. Allow credentials: NO

## Auto-deploy on push

By default, Vercel deploys every time you push to `main`. Branches get
preview deployments at their own URLs. To deploy:

```bash
git add .
git commit -m "Updated product copy"
git push
```

About 90 seconds later, your changes are live at bosfoot.com.

## Common deploy issues

**Build fails with "Cannot find module"**

→ Run `pnpm install` locally, commit the updated `pnpm-lock.yaml`, push.

**Build fails with TypeScript error**

→ Run `pnpm --filter web build` locally first. Fix any errors there before pushing.

**API route returns 500 in production but works in dev**

→ Check Vercel **Functions** log. Usually means `SANITY_WRITE_TOKEN` env var
   wasn't added or has wrong permissions (needs Editor role).

**Sanity returns empty data on Vercel but works locally**

→ Production domain isn't in Sanity CORS origins. See Phase 6 above.

**Images don't load**

→ Check that `astro.config.mjs` has `cdn.sanity.io` in `remotePatterns`. We've
   already configured this.

## Cost expectations

Free tier covers:
- 100 GB bandwidth / month
- Unlimited static requests
- 100,000 serverless function invocations / month (our API routes)

For a v1 shop, you'll be well under these limits. Expect $0/month until you're
seeing 1000+ daily visitors.