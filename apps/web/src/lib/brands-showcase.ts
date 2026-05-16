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
  /** Origin country, shown as subtle metadata. */
  origin: string
  /** Year founded, shown as subtle metadata. */
  founded: number
  /** Short tagline shown on the brands index. Localized. */
  tagline: Record<Locale, string>
}

export const SHOWCASE_BRANDS: ShowcaseBrand[] = [
  {
    slug: 'xero-shoes',
    name: 'Xero Shoes',
    origin: 'USA',
    founded: 2009,
    tagline: {
      mk: 'Лесни, флексибилни патики со широк toe box. Дојдоа од сандали направени дома.',
      sq: 'Këpucë të lehta, fleksibël me hapësirë të gjerë për gishtërinjtë. Erdhën nga sandalet e bëra në shtëpi.',
      en: 'Light, flexible shoes with a wide toe box. Started from sandals made at the kitchen table.',
    },
  },
  {
    slug: 'vivobarefoot',
    name: 'Vivobarefoot',
    origin: 'UK',
    founded: 2012,
    tagline: {
      mk: 'Британски пионери на барефоот — со фокус на одржливост и регенеративни материјали.',
      sq: 'Pionierë britanikë të barefoot — me fokus në qëndrueshmërinë dhe materialet regjeneruese.',
      en: 'British barefoot pioneers — focused on sustainability and regenerative materials.',
    },
  },
  {
    slug: 'lems-shoes',
    name: 'Lems Shoes',
    origin: 'USA',
    founded: 2008,
    tagline: {
      mk: 'Минималистички патики во природна форма на стапалото — комотни и за секојдневно носење.',
      sq: 'Këpucë minimaliste në formë natyrale të këmbës — komode për përdorim të përditshëm.',
      en: 'Minimalist shoes in a natural foot shape — comfortable for everyday wear.',
    },
  },
  {
    slug: 'belenka',
    name: 'Belenka',
    origin: 'Czechia',
    founded: 2017,
    tagline: {
      mk: 'Чешка квалитета и кожа од Европа. Семејна работилница со посветеност на занаетот.',
      sq: 'Cilësi çeke dhe lëkurë nga Evropa. Punëtori familjare me përkushtim ndaj zanatit.',
      en: 'Czech quality and European leather. A family workshop with deep craft commitment.',
    },
  },
  {
    slug: 'groundies',
    name: 'Groundies',
    origin: 'Germany',
    founded: 2018,
    tagline: {
      mk: 'Германски дизајн со урбана естетика. Барефоот патики кои се вклопуваат и во канцеларија.',
      sq: 'Dizajn gjerman me estetikë urbane. Këpucë barefoot që përshtaten edhe në zyrë.',
      en: 'German design with an urban aesthetic. Barefoot shoes that fit the office too.',
    },
  },
]
