/**
 * Brand showcase — five barefoot brands featured on the homepage and
 * the /brands index page. This is a temporary hardcoded list while we
 * wait for the brand documents to be populated in Sanity.
 *
 * When real SVG logos are dropped into `/public/images/brands/{slug}.svg`,
 * set `logoSrc` on the entry below and the component will swap from the
 * text wordmark to the image automatically.
 *
 * Once all five brands have full content in Sanity, this module can be
 * deleted and the pages can return to the existing Sanity-driven queries.
 */

import type { Locale } from './i18n'

export type ShowcaseBrand = {
  slug: string
  name: string
  /** Path under /public — when set, replaces the wordmark with an image. */
  logoSrc?: string
  /**
   * Tailwind classes that give each text wordmark a distinct typographic
   * personality (case + weight + tracking + optional italic). Used only when
   * `logoSrc` is absent. Drop once real SVG logos land.
   */
  wordmarkClass?: string
  /** Origin country, shown as subtle metadata. */
  origin: string
  /** Year founded, shown as subtle metadata. */
  founded: number
  /** Short tagline shown on the brands index. Localized. */
  tagline: Record<Locale, string>
  /** Whether this brand is coming soon. */
  comingSoon?: boolean
}

export const SHOWCASE_BRANDS: ShowcaseBrand[] = [
  {
    slug: 'freet',
    name: 'Freet',
    logoSrc: '/images/brands/freet.jpg',
    origin: 'UK',
    founded: 2010,
    tagline: {
      mk: 'Британски бренд за надворешна употреба — планинарење, патеки, секојдневен живот. Издржливо и со рециклирани материјали.',
      sq: 'Markë britanike për përdorim në natyrë — alpinizëm, shtigje, jetë e përditshme. E qëndrueshme dhe me materiale të ricikluara.',
      en: 'UK brand built for the outdoors — hiking, trails, everyday life. Durable and made with recycled materials.',
    },
    comingSoon: false,
  },
  {
    slug: 'xero-shoes',
    name: 'Xero Shoes',
    wordmarkClass: 'lowercase font-light tracking-tight',
    origin: 'USA',
    founded: 2009,
    tagline: {
      mk: 'Лесни, флексибилни патики со широк toe box. Дојдоа од сандали направени дома.',
      sq: 'Këpucë të lehta, fleksibël me hapësirë të gjerë për gishtërinjtë. Erdhën nga sandalet e bëra në shtëpi.',
      en: 'Light, flexible shoes with a wide toe box. Started from sandals made at the kitchen table.',
    },
    comingSoon: true,
  },
  {
    slug: 'vivobarefoot',
    name: 'Vivobarefoot',
    wordmarkClass: 'lowercase font-extrabold tracking-tighter',
    origin: 'UK',
    founded: 2012,
    tagline: {
      mk: 'Британски пионери на барефоот — со фокус на одржливост и регенеративни материјали.',
      sq: 'Pionierë britanikë të barefoot — me fokus në qëndrueshmërinë dhe materialet regjeneruese.',
      en: 'British barefoot pioneers — focused on sustainability and regenerative materials.',
    },
    comingSoon: true,
  },
  {
    slug: 'groundies',
    name: 'Groundies',
    wordmarkClass: 'uppercase font-normal tracking-[0.35em]',
    origin: 'Germany',
    founded: 2018,
    tagline: {
      mk: 'Германски дизајн со урбана естетика. Барефоот патики кои се вклопуваат и во канцеларија.',
      sq: 'Dizajn gjerman me estetikë urbane. Këпucë barefoot që përshtaten edhe në zyrë.',
      en: 'German design with an urban aesthetic. Barefoot shoes that fit the office too.',
    },
    comingSoon: true,
  },
]
