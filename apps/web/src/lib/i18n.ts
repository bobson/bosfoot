/**
 * Internationalization helpers for Bosfoot.
 *
 * Three locales: mk (Macedonian Cyrillic), sq (Albanian), en (English).
 * Default is mk — bosfoot.com/ redirects to /mk/.
 *
 * URL slugs are translated per locale:
 *   /mk/proizvodi/...
 *   /sq/produktet/...
 *   /en/products/...
 *
 * UI strings are kept here as a flat object — no separate JSON files needed
 * for ~50 strings. If we ever exceed ~200 strings, we'll move to JSON.
 */

export const LOCALES = ['mk', 'sq', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'mk'

export const LOCALE_LABELS: Record<Locale, string> = {
  mk: 'Македонски',
  sq: 'Shqip',
  en: 'English',
}

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  mk: 'МК',
  sq: 'SQ',
  en: 'EN',
}

/**
 * URL path segments. We use English slugs across all locales for v1.
 * This trades a small SEO benefit for significant routing simplicity.
 *
 * URLs look like:
 *   /mk/products
 *   /sq/products
 *   /en/products
 *
 * We can revisit translated slugs (proizvodi/produktet/products) in v2
 * if it proves valuable for organic search rankings in the local market.
 */
export const ROUTES: Record<string, Record<Locale, string>> = {
  products: { mk: 'products', sq: 'products', en: 'products' },
  brands: { mk: 'brands', sq: 'brands', en: 'brands' },
  cart: { mk: 'cart', sq: 'cart', en: 'cart' },
  checkout: { mk: 'checkout', sq: 'checkout', en: 'checkout' },
  about: { mk: 'about', sq: 'about', en: 'about' },
  sizeGuide: { mk: 'size-guide', sq: 'size-guide', en: 'size-guide' },
  contact: { mk: 'contact', sq: 'contact', en: 'contact' },
}

/** Build a localized path: localePath('en', 'products', 'xero-hfs2') → '/en/products/xero-hfs2' */
export function localePath(locale: Locale, route: keyof typeof ROUTES, slug?: string): string {
  const segment = ROUTES[route][locale]
  return slug ? `/${locale}/${segment}/${slug}` : `/${locale}/${segment}`
}

/** Extract locale from a URL pathname like /mk/proizvodi/... */
export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (LOCALES.includes(segment as Locale)) {
    return segment as Locale
  }
  return DEFAULT_LOCALE
}

/** Get the same page in another locale — used by language switcher */
export function switchLocale(currentPath: string, target: Locale): string {
  const segments = currentPath.split('/').filter(Boolean)
  if (LOCALES.includes(segments[0] as Locale)) {
    segments[0] = target
  } else {
    segments.unshift(target)
  }

  // Translate route slug if it matches a known route
  const current = getLocaleFromPath(currentPath)
  if (segments[1]) {
    const routeKey = Object.entries(ROUTES).find(
      ([, slugs]) => slugs[current] === segments[1],
    )?.[0]
    if (routeKey) {
      segments[1] = ROUTES[routeKey][target]
    }
  }

  return '/' + segments.join('/')
}

/** Pick the right value from a localized object. Falls back to mk → en → first available. */
export function pickLocale<T>(
  value: { mk?: T; sq?: T; en?: T } | undefined,
  locale: Locale,
): T | undefined {
  if (!value) return undefined
  return value[locale] ?? value.mk ?? value.en ?? value.sq
}

/* ─────────────────────────────────────────────────────────────────────
   UI STRINGS
   Add new ones here as we build pages. Keep keys descriptive and stable.
   ───────────────────────────────────────────────────────────────────── */

type UIStrings = Record<string, Record<Locale, string>>

export const ui: UIStrings = {
  // Navigation
  'nav.products': {
    mk: 'Производи',
    sq: 'Produktet',
    en: 'Products',
  },
  'nav.brands': {
    mk: 'Брендови',
    sq: 'Markat',
    en: 'Brands',
  },
  'nav.about': {
    mk: 'За нас',
    sq: 'Rreth nesh',
    en: 'About',
  },
  'nav.sizeGuide': {
    mk: 'Водич за големини',
    sq: 'Udhëzues përmasash',
    en: 'Size guide',
  },

  // Buttons / CTAs
  'cta.shopNow': {
    mk: 'Купи сега',
    sq: 'Bli tani',
    en: 'Shop now',
  },
  'cta.viewAll': {
    mk: 'Прикажи ги сите',
    sq: 'Shiko të gjitha',
    en: 'View all',
  },
  'cta.addToCart': {
    mk: 'Додај во кошничка',
    sq: 'Shto në shportë',
    en: 'Add to cart',
  },

  // Sections
  'section.featured': {
    mk: 'Издвоени производи',
    sq: 'Produkte të zgjedhura',
    en: 'Featured shoes',
  },
  'section.newArrivals': {
    mk: 'Нови модели',
    sq: 'Modele të reja',
    en: 'New arrivals',
  },
  'section.brands': {
    mk: 'Нашите брендови',
    sq: 'Markat tona',
    en: 'Our brands',
  },
  'section.philosophy': {
    mk: 'Зошто боси патики',
    sq: 'Pse këpucë barefoot',
    en: 'Why barefoot',
  },

  // Product card
  'product.from': {
    mk: 'од',
    sq: 'nga',
    en: 'from',
  },
  'product.outOfStock': {
    mk: 'Нема на залиха',
    sq: 'Pa stok',
    en: 'Out of stock',
  },
  'product.inStock': {
    mk: 'На залиха',
    sq: 'Në stok',
    en: 'In stock',
  },
  'product.new': {
    mk: 'Ново',
    sq: 'E re',
    en: 'New',
  },
  'product.sale': {
    mk: 'Акција',
    sq: 'Ulje',
    en: 'Sale',
  },
  'product.sizesAvailable': {
    mk: 'Достапни големини',
    sq: 'Madhësitë e disponueshme',
    en: 'Available sizes',
  },

  // Currency
  'currency.MKD': {
    mk: 'ден',
    sq: 'denarë',
    en: 'MKD',
  },

  // Footer
  'footer.tagline': {
    mk: 'Босоноги патики за слобода и природно движење.',
    sq: 'Këpucë barefoot për liri dhe lëvizje natyrale.',
    en: 'Barefoot shoes for freedom and natural movement.',
  },
  'footer.copyright': {
    mk: '© 2026 Bosfoot. Сите права задржани.',
    sq: '© 2026 Bosfoot. Të gjitha të drejtat e rezervuara.',
    en: '© 2026 Bosfoot. All rights reserved.',
  },

  // Filter / activity translations
  'filter.activity': {
    mk: 'Активност',
    sq: 'Aktiviteti',
    en: 'Activity',
  },
  'activity.running': {
    mk: 'Трчање',
    sq: 'Vrapim',
    en: 'Running',
  },
  'activity.hiking': {
    mk: 'Планинарење',
    sq: 'Alpinizëm',
    en: 'Hiking',
  },
  'activity.training': {
    mk: 'Тренинг',
    sq: 'Trajnim',
    en: 'Training',
  },
  'activity.casual': {
    mk: 'Секојдневно',
    sq: 'E përditshme',
    en: 'Casual',
  },
  'activity.office': {
    mk: 'Канцеларија',
    sq: 'Zyrë',
    en: 'Office',
  },
  'activity.water': {
    mk: 'Вода',
    sq: 'Ujë',
    en: 'Water',
  },
  'activity.winter': {
    mk: 'Зима',
    sq: 'Dimër',
    en: 'Winter',
  },
  'activity.kids': {
    mk: 'Деца',
    sq: 'Fëmijë',
    en: 'Kids',
  },

  // Gender / target wearer
  'filter.gender': {
    mk: 'За кого',
    sq: 'Për kë',
    en: 'For',
  },
  'gender.mens': {
    mk: 'Машки',
    sq: 'Burra',
    en: "Men's",
  },
  'gender.womens': {
    mk: 'Женски',
    sq: 'Gra',
    en: "Women's",
  },
  'gender.unisex': {
    mk: 'Унисекс',
    sq: 'Unisex',
    en: 'Unisex',
  },
  'gender.kids': {
    mk: 'Детски',
    sq: 'Fëmijë',
    en: 'Kids',
  },

  // Filters / listing
  'filter.title': {
    mk: 'Филтри',
    sq: 'Filtra',
    en: 'Filters',
  },
  'filter.brand': {
    mk: 'Бренд',
    sq: 'Marka',
    en: 'Brand',
  },
  'filter.size': {
    mk: 'Големина',
    sq: 'Madhësia',
    en: 'Size',
  },
  'filter.inStock': {
    mk: 'Само на залиха',
    sq: 'Vetëm në stok',
    en: 'In stock only',
  },
  'filter.clear': {
    mk: 'Исчисти',
    sq: 'Pastro',
    en: 'Clear all',
  },
  'filter.apply': {
    mk: 'Примени',
    sq: 'Apliko',
    en: 'Apply',
  },
  'filter.activeCount': {
    mk: 'активни филтри',
    sq: 'filtra aktivë',
    en: 'active',
  },
  'sort.title': {
    mk: 'Подреди',
    sq: 'Rendit',
    en: 'Sort',
  },
  'sort.newest': {
    mk: 'Најнови',
    sq: 'Më të rejat',
    en: 'Newest',
  },
  'sort.priceAsc': {
    mk: 'Цена: ниска кон висока',
    sq: 'Çmimi: ulët në lartë',
    en: 'Price: low to high',
  },
  'sort.priceDesc': {
    mk: 'Цена: висока кон ниска',
    sq: 'Çmimi: lartë në ulët',
    en: 'Price: high to low',
  },
  'listing.title': {
    mk: 'Сите производи',
    sq: 'Të gjitha produktet',
    en: 'All products',
  },
  'listing.count': {
    mk: 'производи',
    sq: 'produkte',
    en: 'products',
  },
  'listing.empty': {
    mk: 'Нема производи кои одговараат на твоите филтри.',
    sq: 'Asnjë produkt nuk përputhet me filtrat e tu.',
    en: 'No products match your filters.',
  },

  // Brand page
  'brand.foundedIn': {
    mk: 'Основан во',
    sq: 'Themeluar në',
    en: 'Founded in',
  },
  'brand.from': {
    mk: 'Потекло',
    sq: 'Origjina',
    en: 'Origin',
  },
  'brand.officialSite': {
    mk: 'Официјална страница',
    sq: 'Faqja zyrtare',
    en: 'Official site',
  },
  'brand.sizeChart': {
    mk: 'Табела на големини',
    sq: 'Tabela e madhësive',
    en: 'Size chart',
  },
  'brand.sizeChart.measureFoot': {
    mk: 'Должина на стапалото',
    sq: 'Gjatësia e këmbës',
    en: 'Foot length',
  },
  'brand.sizeChart.measureInsole': {
    mk: 'Должина на влошката',
    sq: 'Gjatësia e shollës',
    en: 'Insole length',
  },

  // Size chart modal
  'sizeChart.howToMeasure': {
    mk: 'Како да измериш',
    sq: 'Si të masësh',
    en: 'How to measure',
  },
  'sizeChart.measureInstructions': {
    mk: 'Стави го стапалото на лист хартија, нацртај го контурата и измери ја најдолгата точка (од петицата до најдолгиот прст).',
    sq: 'Vendos këmbën në një fletë letër, vizato konturin dhe mat pikën më të gjatë (nga thembra te gishti më i gjatë).',
    en: 'Place your foot on a sheet of paper, trace the outline, and measure the longest point (heel to longest toe).',
  },
  'sizeChart.needHelp': {
    mk: 'Не си сигурен за големината?',
    sq: 'Nuk je i sigurt për madhësinë?',
    en: 'Not sure which size?',
  },
  'sizeChart.helpDescription': {
    mk: 'Големината зависи од моделот, типот на чорапи и личната преференца. Контактирај нѐ и ќе ти помогнеме да ја избереш вистинската големина.',
    sq: 'Madhësia varet nga modeli, lloji i çorapeve dhe preferenca personale. Na kontakto dhe do të të ndihmojmë të zgjedhësh madhësinë e duhur.',
    en: 'Sizing varies by model, sock type, and personal preference. Contact us and we\'ll help you pick the right size.',
  },
  'sizeChart.contactUs': {
    mk: 'Контактирај нѐ',
    sq: 'Na kontakto',
    en: 'Contact us',
  },
  'sizeChart.officialGuide': {
    mk: 'Официјален водич',
    sq: 'Udhëzues zyrtar',
    en: 'Official guide',
  },
  'sizeChart.helpEmail': {
    mk: 'contact@bosfoot.com',
    sq: 'contact@bosfoot.com',
    en: 'contact@bosfoot.com',
  },

  // Product detail page
  'detail.size': {
    mk: 'Големина',
    sq: 'Madhësia',
    en: 'Size',
  },
  'detail.color': {
    mk: 'Боја',
    sq: 'Ngjyra',
    en: 'Color',
  },
  'detail.selectSize': {
    mk: 'Избери големина',
    sq: 'Zgjidh madhësinë',
    en: 'Select a size',
  },
  'detail.sizeGuide': {
    mk: 'Водич за големини',
    sq: 'Udhëzues përmasash',
    en: 'Size guide',
  },
  'detail.lowStock': {
    mk: 'Останати само',
    sq: 'Mbeten vetëm',
    en: 'Only',
  },
  'detail.lowStockSuffix': {
    mk: 'парчиња',
    sq: 'palë',
    en: 'left',
  },
  'detail.moreFromBrand': {
    mk: 'Повеќе на официјалната страница',
    sq: 'Më shumë në faqen zyrtare',
    en: 'More info on official site',
  },
  'detail.specs': {
    mk: 'Спецификации',
    sq: 'Specifikimet',
    en: 'Specifications',
  },
  'detail.specs.soleThickness': {
    mk: 'Дебелина на ѓонот',
    sq: 'Trashësia e shollës',
    en: 'Sole thickness',
  },
  'detail.specs.weight': {
    mk: 'Тежина',
    sq: 'Pesha',
    en: 'Weight',
  },
  'detail.specs.withInsole': {
    mk: 'со влошка',
    sq: 'me sole',
    en: 'with insole',
  },
  'detail.specs.mens': {
    mk: 'машки',
    sq: 'burra',
    en: "men's",
  },
  'detail.specs.womens': {
    mk: 'женски',
    sq: 'gra',
    en: "women's",
  },
  'detail.specs.reflective': {
    mk: 'Рефлектирачки елементи',
    sq: 'Elemente reflektues',
    en: 'Reflective elements',
  },
  'detail.specs.closure': {
    mk: 'Закопчување',
    sq: 'Mbyllja',
    en: 'Closure',
  },
  'detail.specs.upperMaterial': {
    mk: 'Горен материјал',
    sq: 'Materiali i sipërm',
    en: 'Upper material',
  },
  'detail.specs.soleMaterial': {
    mk: 'Материјал на ѓонот',
    sq: 'Materiali i shollës',
    en: 'Sole material',
  },
  'detail.specs.lining': {
    mk: 'Подлога',
    sq: 'Astarit',
    en: 'Lining',
  },
  'detail.specs.vegan': {
    mk: 'Веганско',
    sq: 'Vegan',
    en: 'Vegan',
  },
  'detail.specs.waterproof': {
    mk: 'Водоотпорно',
    sq: 'I papërshkueshëm nga uji',
    en: 'Waterproof',
  },
  'detail.specs.insulation': {
    mk: 'Изолирано',
    sq: 'I izoluar',
    en: 'Insulated',
  },
  'detail.specs.insoleRemovable': {
    mk: 'Влошка',
    sq: 'Soletë',
    en: 'Insole',
  },
  'detail.specs.removable': {
    mk: 'извадлива',
    sq: 'e lëvizshme',
    en: 'removable',
  },
  'detail.specs.madeIn': {
    mk: 'Произведено во',
    sq: 'Prodhuar në',
    en: 'Made in',
  },
  'detail.closure.laces': {
    mk: 'Врвки',
    sq: 'Lidhëse',
    en: 'Laces',
  },
  'detail.closure.velcro': {
    mk: 'Лепенка',
    sq: 'Velcro',
    en: 'Velcro',
  },
  'detail.closure.slipOn': {
    mk: 'Без врвки',
    sq: 'Pa lidhëse',
    en: 'Slip-on',
  },
  'detail.closure.elastic': {
    mk: 'Еластика',
    sq: 'Elastike',
    en: 'Elastic',
  },
  'detail.closure.buckle': {
    mk: 'Тока',
    sq: 'Tokë',
    en: 'Buckle',
  },
  'detail.yes': {
    mk: 'Да',
    sq: 'Po',
    en: 'Yes',
  },
  'detail.no': {
    mk: 'Не',
    sq: 'Jo',
    en: 'No',
  },
}

/** Look up a UI string for a locale. Falls back to mk if missing. */
export function t(key: keyof typeof ui | string, locale: Locale): string {
  const entry = ui[key]
  if (!entry) {
    if (import.meta.env.DEV) console.warn(`Missing translation: ${key}`)
    return key
  }
  return entry[locale] ?? entry.mk
}

/* ─────────────────────────────────────────────────────────────────────
   PRICE FORMATTING

   Bosfoot prices are stored in MKD. On non-MK locales we show the EUR
   equivalent in brackets to help international visitors orient quickly.

   Conversion rate is hardcoded — the MKD-EUR pair is stable (~61.5 ± 1%
   for over 20 years thanks to North Macedonia's currency board peg).
   If it ever drifts meaningfully, change the constant below.
   ───────────────────────────────────────────────────────────────────── */

/** Mid-market exchange rate. Update this if MKD/EUR drifts more than ~2%. */
export const MKD_PER_EUR = 61.5

/** Format integer with space as thousands separator. Locale-deterministic. */
function formatInt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Format a number to fixed 2 decimals with space thousands separator. */
function formatTwoDecimals(n: number): string {
  // Round to 2 decimals first, then format. Use Math.round to keep determinism
  // (toFixed uses banker's rounding inconsistently across runtimes).
  const rounded = Math.round(n * 100) / 100
  const [intPart, decPart = '00'] = rounded.toFixed(2).split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${intFormatted}.${decPart}`
}

/**
 * Format a price for display.
 *
 * On `mk` locale: just MKD, e.g. `7 500 ден`
 * On `sq` / `en` locale: MKD with EUR in brackets, e.g. `7 500 ден (122.00 €)`
 *
 * Always uses space as thousands separator — this matches MKD convention,
 * is unambiguous internationally, and avoids server/client locale mismatch
 * which causes React hydration errors.
 */
export function formatPrice(amount: number, locale: Locale, currency = 'MKD'): string {
  const mkdString = `${formatInt(amount)} ${t(`currency.${currency}`, locale)}`

  if (locale === 'mk' || currency !== 'MKD') {
    return mkdString
  }

  const eurAmount = amount / MKD_PER_EUR
  return `${mkdString} (${formatTwoDecimals(eurAmount)} €)`
}