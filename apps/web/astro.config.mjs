// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

/**
 * Bosfoot frontend configuration.
 *
 * Rendering model:
 *   - `output: 'static'` would pre-render everything at build time (fastest, cheapest)
 *   - `output: 'server'` would render every page on every request (most flexible)
 *   - `output: 'hybrid'` lets us mix: pre-render pages by default, opt specific
 *     routes into server-side rendering via `export const prerender = false`
 *
 * We use hybrid because most pages (homepage, listing, brand, product detail)
 * are content-driven and re-build only when catalog changes. But the checkout
 * API and order-confirmed page need server-side execution to write to Sanity
 * and read fresh order data per-request.
 */
export default defineConfig({
  site: "https://bosfoot.com",
  output: "server",
  adapter: vercel(),

  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        // Exclude the root redirect (/ → /mk/) and non-indexable pages.
        !page.match(/^https:\/\/bosfoot\.com\/?$/) &&
        !page.includes("/checkout") &&
        !page.includes("/order-confirmed"),
      i18n: {
        defaultLocale: "mk",
        locales: { mk: "mk", sq: "sq", en: "en" },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: "auto",
  },

  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
});
