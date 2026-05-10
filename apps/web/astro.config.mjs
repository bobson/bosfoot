// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

/**
 * Bosfoot frontend configuration.
 *
 * Three locales: Macedonian (Cyrillic), Albanian, English.
 * Macedonian is the default — bosfoot.com/ redirects to /mk/.
 *
 * We handle locale via the [lang] dynamic route (src/pages/[lang]/...),
 * NOT Astro's built-in i18n config — because we need translated URL slugs
 * (proizvodi vs produktet vs products) which Astro's i18n doesn't support.
 */
export default defineConfig({
  site: 'https://bosfoot.com',

  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'mk',
        locales: { mk: 'mk', sq: 'sq', en: 'en' },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },

  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
})
