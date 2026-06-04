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

export const LOCALE_FLAGS: Record<Locale, string> = {
  mk: '🇲🇰',
  sq: '🇦🇱',
  en: '🇬🇧',
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
  newToBarefoot: { mk: 'new-to-barefoot', sq: 'new-to-barefoot', en: 'new-to-barefoot' },
  cart: { mk: 'cart', sq: 'cart', en: 'cart' },
  checkout: { mk: 'checkout', sq: 'checkout', en: 'checkout' },
  about: { mk: 'about', sq: 'about', en: 'about' },
  sizeGuide: { mk: 'size-guide', sq: 'size-guide', en: 'size-guide' },
  contact: { mk: 'contact', sq: 'contact', en: 'contact' },
  articles: { mk: 'articles', sq: 'articles', en: 'articles' },
  privacy: { mk: 'privacy', sq: 'privacy', en: 'privacy' },
  terms: { mk: 'terms', sq: 'terms', en: 'terms' },
  returns: { mk: 'returns', sq: 'returns', en: 'returns' },
  shipping: { mk: 'shipping', sq: 'shipping', en: 'shipping' },
}

/**
 * Build a localized path. Extra slug segments are appended in order:
 *   localePath('en', 'products')                       → '/en/products'
 *   localePath('en', 'products', 'freet', 'vibe-2')    → '/en/products/freet/vibe-2'
 */
export function localePath(
  locale: Locale,
  route: keyof typeof ROUTES,
  ...slugs: string[]
): string {
  const segment = ROUTES[route][locale]
  const tail = slugs.filter(Boolean).join('/')
  return tail ? `/${locale}/${segment}/${tail}` : `/${locale}/${segment}`
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

/** Pick the right value from a localized object. Falls back to mk → en → sq.
 *  Empty strings are treated as missing so locale fields stored as `''`
 *  (e.g. content that's English-only with mk: '' placeholder) fall through. */
export function pickLocale<T>(
  value: { mk?: T; sq?: T; en?: T } | undefined,
  locale: Locale,
): T | undefined {
  if (!value) return undefined
  const pick = (v: T | undefined): T | undefined =>
    typeof v === 'string' ? (v.trim() ? v : undefined) : v
  return pick(value[locale]) ?? pick(value.mk) ?? pick(value.en) ?? pick(value.sq)
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
  'nav.newToBarefoot': {
    mk: 'Здравје на стапалата',
    sq: 'Shëndeti i këmbëve',
    en: 'Foot Health',
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

  // Homepage — hero
  'home.hero.line1': {
    mk: 'Слободата почнува',
    sq: 'Liria fillon',
    en: 'Freedom starts',
  },
  'home.hero.line2': {
    mk: 'од твоите стапала',
    sq: 'tek këmbët e tua',
    en: 'at your feet',
  },
  'home.hero.lead': {
    mk: 'Премиум боси патики за оние кои сакаат природен чекор. Изработени од европските мајстори на занаетот.',
    sq: 'Këpucë barefoot premium për ata që duan një hap natyral. Të punuara nga mjeshtrit evropianë.',
    en: 'Premium barefoot shoes for people who want a natural step. Made by European masters of the craft.',
  },
  'home.hero.shopMen': {
    mk: 'Машки',
    sq: 'Burra',
    en: "Men's",
  },
  'home.hero.shopWomen': {
    mk: 'Женски',
    sq: 'Gra',
    en: "Women's",
  },
  'home.hero.shopKids': {
    mk: 'Детски',
    sq: 'Fëmijë',
    en: 'Kids',
  },

  // Hero rotating quotes
  'home.quote.1.text': {
    mk: 'Стапалото е чудо од инженерство — 26 коски, 33 зглобови, над 100 мускули. Дозволи му да работи.',
    sq: 'Këmba është një mrekulli inxhinierike — 26 kocka, 33 nyje, mbi 100 muskuj. Lëre të punojë.',
    en: 'The foot is an engineering marvel — 26 bones, 33 joints, over 100 muscles. Let it work.',
  },
  'home.quote.1.attr': {
    mk: 'Анатомски факт',
    sq: 'Fakt anatomik',
    en: 'Anatomical fact',
  },
  'home.quote.2.text': {
    mk: 'Прстите треба да се распостелат, не да се згрчуваат. Стапалата треба да чувствуваат, не да се изолираат.',
    sq: 'Gishtërinjtë duhet të hapen, jo të mblidhen. Këmbët duhet të ndjejnë, jo të izolohen.',
    en: 'Toes should splay, not squeeze. Feet should feel, not be isolated.',
  },
  'home.quote.2.attr': {
    mk: 'Filozofija barefoot',
    sq: 'Filozofia barefoot',
    en: 'Barefoot philosophy',
  },
  'home.quote.3.text': {
    mk: 'Се родивме без обувки. Барефоот е најблиску до тоа како природата нѐ замислила.',
    sq: 'Lindëm pa këpucë. Barefoot është më e afërta me atë që natyra na ka projektuar.',
    en: 'We were born without shoes. Barefoot is the closest you can get to how nature designed us.',
  },
  'home.quote.3.attr': {
    mk: 'Bosfoot',
    sq: 'Bosfoot',
    en: 'Bosfoot',
  },

  // Homepage — Why barefoot section
  'home.whyBarefoot.title': {
    mk: 'Зошто боси патики',
    sq: 'Pse këpucë barefoot',
    en: 'Why barefoot',
  },
  'home.whyBarefoot.lead': {
    mk: 'Три принципи кои го прават барефоот различен од сѐ друго.',
    sq: 'Tre parime që e bëjnë barefoot të ndryshëm nga gjithçka tjetër.',
    en: 'Three principles that make barefoot different from everything else.',
  },
  'home.whyBarefoot.1.title': {
    mk: 'Широк простор за прстите',
    sq: 'Hapësirë e gjerë për gishtërinjtë',
    en: 'Wide toe box',
  },
  'home.whyBarefoot.1.body': {
    mk: 'Прстите се распостеливаат природно, баланасот се подобрува, деформитетите се намалуваат.',
    sq: 'Gishtërinjtë hapen natyrshëm, ekuilibri përmirësohet, deformitetet zvogëlohen.',
    en: 'Toes splay naturally, balance improves, deformities decrease.',
  },
  'home.whyBarefoot.2.title': {
    mk: 'Нула разлика во висина',
    sq: 'Zero diferencë në lartësi',
    en: 'Zero drop',
  },
  'home.whyBarefoot.2.body': {
    mk: 'Петицата и прстите се на исто ниво. Држење на тело како кога одиш бос.',
    sq: 'Thembra dhe gishtërinjtë janë në të njëjtin nivel. Qëndrimi i trupit si kur ec zbathur.',
    en: 'Heel and toes at the same level. Posture as if you were walking barefoot.',
  },
  'home.whyBarefoot.3.title': {
    mk: 'Тенок флексибилен ѓон',
    sq: 'Shollë e hollë fleksibël',
    en: 'Thin, flexible sole',
  },
  'home.whyBarefoot.3.body': {
    mk: 'Чувствуваш што е под тебе. Мускулите се будат. Стапалото станува посилно секој ден.',
    sq: 'Ndjen atë që ke nën këmbë. Muskujt zgjohen. Këmba bëhet më e fortë çdo ditë.',
    en: 'You feel what is under you. Muscles wake up. Feet get stronger every day.',
  },

  // Homepage — Why Bosfoot section
  'home.whyUs.title': {
    mk: 'Зошто Bosfoot',
    sq: 'Pse Bosfoot',
    en: 'Why Bosfoot',
  },
  'home.whyUs.1.title': {
    mk: 'Внимателно избрана колекција',
    sq: 'Përzgjedhje e kuruar',
    en: 'Curated selection',
  },
  'home.whyUs.1.body': {
    mk: 'Само премиум европски брендови. Никаков филер, никакво масовно производство.',
    sq: 'Vetëm marka premium evropiane. Asnjë mbushje, asnjë prodhim masiv.',
    en: 'Only premium European brands. No filler, no mass-market.',
  },
  'home.whyUs.2.title': {
    mk: 'Лична совет за големина',
    sq: 'Këshillë personale për madhësinë',
    en: 'Personal sizing advice',
  },
  'home.whyUs.2.body': {
    mk: 'Си имаме секоја пара во раце. Прашај нѐ за вистинската големина — одговараме лично.',
    sq: 'I kemi të gjitha palët në duart tona. Na pyet për madhësinë e duhur — përgjigjemi personalisht.',
    en: 'We have every pair in our hands. Ask us for the right size — we answer personally.',
  },
  'home.whyUs.3.title': {
    mk: 'Регионална испорака',
    sq: 'Dërgim rajonal',
    en: 'Regional shipping',
  },
  'home.whyUs.3.body': {
    mk: 'Брза испорака низ Балканот. Враќање без покривање, без прашања.',
    sq: 'Dërgim i shpejtë në Ballkan. Kthimi pa kushte, pa pyetje.',
    en: 'Fast shipping across the Balkans. Returns no-questions-asked.',
  },

  // Homepage — Articles section
  'home.articles.title': {
    mk: 'Од нашиот блог',
    sq: 'Nga blogu ynë',
    en: 'From our blog',
  },
  'home.articles.lead': {
    mk: 'Сѐ што треба да знаеш за барефоот стилот на живот.',
    sq: 'Gjithçka që duhet të dish për stilin e jetës barefoot.',
    en: 'Everything you need to know about the barefoot lifestyle.',
  },
  'home.articles.viewAll': {
    mk: 'Сите статии',
    sq: 'Të gjitha artikujt',
    en: 'All articles',
  },
  'home.articles.readMore': {
    mk: 'Прочитај повеќе',
    sq: 'Lexo më shumë',
    en: 'Read more',
  },

  // Homepage — section connecting featured products to hero
  'home.featured.title': {
    mk: 'Селектирани за тебе',
    sq: 'Të zgjedhura për ty',
    en: 'Selected for you',
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

  // Checkout
  'checkout.contact': { mk: 'Контакт', sq: 'Kontakt', en: 'Contact' },
  'checkout.email': { mk: 'Е-пошта', sq: 'Email', en: 'Email' },
  'checkout.phone': { mk: 'Телефон', sq: 'Telefon', en: 'Phone' },
  'checkout.shipping': { mk: 'Адреса за испорака', sq: 'Adresa e dërgimit', en: 'Shipping address' },
  'checkout.firstName': { mk: 'Ime', sq: 'Emri', en: 'First name' },
  'checkout.lastName': { mk: 'Презиме', sq: 'Mbiemri', en: 'Last name' },
  'checkout.address': { mk: 'Адреса', sq: 'Adresa', en: 'Address' },
  'checkout.city': { mk: 'Град', sq: 'Qyteti', en: 'City' },
  'checkout.postalCode': { mk: 'Поштенски код', sq: 'Kodi postar', en: 'Postal code' },
  'checkout.country': { mk: 'Држава', sq: 'Shteti', en: 'Country' },
  'checkout.notes': { mk: 'Напомена (опционално)', sq: 'Shënim (opsional)', en: 'Notes (optional)' },
  'checkout.notesPlaceholder': {
    mk: 'Посебни барања, инструкции за испорака...',
    sq: 'Kërkesa speciale, udhëzime dërgimi...',
    en: 'Special requests, delivery instructions...',
  },
  'checkout.payment': { mk: 'Начин на плаќање', sq: 'Mënyra e pagesës', en: 'Payment method' },
  'checkout.summary': { mk: 'Преглед на нарачката', sq: 'Përmbledhja e porosisë', en: 'Order summary' },
  'checkout.shippingLabel': { mk: 'Достава', sq: 'Transporti', en: 'Shipping' },
  'checkout.freeShipping': { mk: 'Бесплатно', sq: 'Falas', en: 'Free' },
  'checkout.total': { mk: 'Вкупно', sq: 'Totali', en: 'Total' },
  'checkout.placeOrder': { mk: 'Нарачај', sq: 'Porosit', en: 'Place order' },
  'checkout.placing': { mk: 'Се нарачува...', sq: 'Duke porositur...', en: 'Placing order...' },
  'checkout.terms': {
    mk: 'Со нарачувањето се согласувате со нашите услови на продажба.',
    sq: 'Duke porositur, pranoni kushtet tona të shitjes.',
    en: 'By ordering you agree to our terms of sale.',
  },

  // Payment methods
  'payment.cod': { mk: 'Плаќање при испорака', sq: 'Paguaj me dorëzim', en: 'Cash on delivery' },
  'payment.codDescription': {
    mk: 'Платете во готово кога ќе ја примите пратката.',
    sq: 'Paguani me para kesh kur të merrni paketën.',
    en: 'Pay in cash when your package arrives.',
  },
  'payment.bankTransfer': { mk: 'Банкарски трансфер', sq: 'Transfer bankar', en: 'Bank transfer' },
  'payment.bankTransferDescription': {
    mk: 'Ќе добиете банкарски детали по нарачката. Испораката почнува по потврдата на уплатата.',
    sq: 'Do të merrni detajet bankare pas porosisë. Dërgimi fillon pas konfirmimit të pagesës.',
    en: 'You\'ll receive bank details after ordering. Shipping starts after payment confirmation.',
  },

  // Countries
  'country.MK': { mk: 'Северна Македонија', sq: 'Maqedonia e Veriut', en: 'North Macedonia' },
  'country.AL': { mk: 'Албанија', sq: 'Shqipëria', en: 'Albania' },
  'country.XK': { mk: 'Косово', sq: 'Kosova', en: 'Kosovo' },
  'country.RS': { mk: 'Србија', sq: 'Serbia', en: 'Serbia' },
  'country.BG': { mk: 'Бугарија', sq: 'Bullgaria', en: 'Bulgaria' },
  'country.GR': { mk: 'Грција', sq: 'Greqia', en: 'Greece' },

  // Order confirmation
  'order.confirmed': { mk: 'Нарачката е потврдена!', sq: 'Porosia u konfirmua!', en: 'Order confirmed!' },
  'order.number': { mk: 'Број на нарачка', sq: 'Numri i porosisë', en: 'Order number' },
  'order.thanks': {
    mk: 'Ви благодариме за нарачката. Ќе ве контактираме наскоро.',
    sq: 'Faleminderit për porosinë. Do t\'ju kontaktojmë së shpejti.',
    en: 'Thank you for your order. We\'ll be in touch shortly.',
  },
  'order.cod': {
    mk: 'Плаќате при испорака. Очекувајте пакетот во рок од 2-5 работни дена.',
    sq: 'Paguani me dorëzim. Prisni paketën brenda 2-5 ditëve pune.',
    en: 'You\'ll pay on delivery. Expect your package within 2-5 business days.',
  },
  'order.bankTransfer': {
    mk: 'Ви испративме е-пошта со банкарски детали. Испораката почнува по уплатата.',
    sq: 'Ju dërguam email me detajet bankare. Dërgimi fillon pas pagesës.',
    en: 'We sent you an email with bank details. Shipping starts after payment.',
  },
  'order.continueShopping': { mk: 'Продолжи со купување', sq: 'Vazhdo blerjet', en: 'Continue shopping' },

  // Cart drawer
  'cart.title': {
    mk: 'Кошничка',
    sq: 'Shporta',
    en: 'Cart',
  },
  'cart.empty': {
    mk: 'Кошничката е празна.',
    sq: 'Shporta është bosh.',
    en: 'Your cart is empty.',
  },
  'cart.emptyCta': {
    mk: 'Разгледај производи',
    sq: 'Shfleto produktet',
    en: 'Browse products',
  },
  'cart.size': {
    mk: 'Големина',
    sq: 'Madhësia',
    en: 'Size',
  },
  'cart.subtotal': {
    mk: 'Меѓузбир',
    sq: 'Nën-totali',
    en: 'Subtotal',
  },
  'cart.shippingNote': {
    mk: 'Поштарината се пресметува при достава.',
    sq: 'Transporti llogaritet në arkë.',
    en: 'Shipping calculated at checkout.',
  },
  'cart.checkout': {
    mk: 'Кон достава',
    sq: 'Te arka',
    en: 'Checkout',
  },
  'cart.continueShopping': {
    mk: 'Продолжи со разгледување',
    sq: 'Vazhdo blerjet',
    en: 'Continue shopping',
  },
  'cart.remove': {
    mk: 'Отстрани',
    sq: 'Hiq',
    en: 'Remove',
  },
  'cart.quantity': {
    mk: 'Количина',
    sq: 'Sasia',
    en: 'Quantity',
  },
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
  'filter.showResults': {
    mk: 'Прикажи',
    sq: 'Shfaq',
    en: 'Show',
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
    mk: 'info@bosfoot.com',
    sq: 'info@bosfoot.com',
    en: 'info@bosfoot.com',
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
  'detail.relatedTitle': {
    mk: 'Повеќе од',
    sq: 'Më shumë nga',
    en: 'More from',
  },
  'detail.sizeAndFit': {
    mk: 'Големина и форма',
    sq: 'Madhësia dhe forma',
    en: 'Size & fit',
  },
  'detail.aboutShoe': {
    mk: 'За оваа патика',
    sq: 'Rreth kësaj këpuce',
    en: 'About this shoe',
  },
  'detail.productInfo': {
    mk: 'Информации за производот',
    sq: 'Informacion mbi produktin',
    en: 'Product info',
  },
  'detail.sustainability': {
    mk: 'Одржливост',
    sq: 'Qëndrueshmëria',
    en: 'Sustainability',
  },
  'detail.viewAllFromBrand': {
    mk: 'Сите од',
    sq: 'Të gjitha nga',
    en: 'View all from',
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

  // ── Brands index page ─────────────────────────────────────
  'brands.title': {
    mk: 'Брендови',
    sq: 'Markat',
    en: 'Brands',
  },
  'brands.lead': {
    mk: 'Внимателно избрана колекција од европски мајстори за боси патики. Секој бренд има своја филозофија — заедничко им е длабокото почитување на анатомијата на стапалото.',
    sq: 'Koleksion i zgjedhur me kujdes nga mjeshtër evropianë të këpucëve barefoot. Çdo markë ka filozofinë e saj — të përbashkët kanë respektin e thellë për anatominë e këmbës.',
    en: 'A hand-picked collection from European barefoot makers. Each brand has its own philosophy — what they share is a deep respect for the anatomy of the foot.',
  },
  'brands.productCount.one': {
    mk: 'производ',
    sq: 'produkt',
    en: 'product',
  },
  'brands.productCount.many': {
    mk: 'производи',
    sq: 'produkte',
    en: 'products',
  },
  'brands.viewProducts': {
    mk: 'Види производи →',
    sq: 'Shiko produktet →',
    en: 'View products →',
  },
  'brands.comingSoon': {
    mk: 'Наскоро',
    sq: 'Së shpejti',
    en: 'Coming soon',
  },

  // ── Size guide page ───────────────────────────────────────
  'sizeGuide.title': {
    mk: 'Водич за големини',
    sq: 'Udhëzues përmasash',
    en: 'Size guide',
  },
  'sizeGuide.lead': {
    mk: 'Боси патики се мерат поинаку. Прстите имаат потреба од простор, па ширината е исто толку важна како должината. Овој водич ќе ти помогне да го најдеш совршениот пар.',
    sq: 'Këpucët barefoot maten ndryshe. Gishtërinjtë kanë nevojë për hapësirë, prandaj gjerësia është po aq e rëndësishme sa gjatësia. Ky udhëzues do të të ndihmojë të gjesh palën e duhur.',
    en: 'Barefoot shoes fit differently. Toes need room to splay, so width matters as much as length. This guide will help you find the perfect pair.',
  },
  'sizeGuide.step1.title': {
    mk: '1. Почни со твојата вообичаена големина',
    sq: '1. Fillo me madhësinë tënde të zakonshme',
    en: '1. Start with your usual size',
  },
  'sizeGuide.step1.body': {
    mk: 'Најдобриот водич за големина е да почнеш со твојата вообичаена големина на чевли. На страницата на секој производ ќе најдеш конкретни информации за одговарање: „одговара помало" — земи поголема; „одговара точно" — нарачај нормална; „одговара поголемо" — земи помала.',
    sq: 'Udhëzuesi më i mirë për madhësinë është të fillosh me madhësinë tënde të zakonshme të këpucëve. Në faqen e çdo produkti do të gjesh informacion specifik për përshtatjen: "shkon i vogël" — merr një madhësi më të madhe; "shkon saktë" — porosit madhësinë normale; "shkon i madh" — merr një madhësi më të vogël.',
    en: 'The best guide is to start with your usual shoe size. On each product page you\'ll find specific fit notes: "fits small" — go up a size; "fits true" — order your normal size; "fits large" — go down a size.',
  },
  'sizeGuide.step2.title': {
    mk: '2. Нацртај го стапалото',
    sq: '2. Vizato këmbën',
    en: '2. Trace your foot',
  },
  'sizeGuide.step2.body': {
    mk: 'Стани покрај ѕид и стави лист хартија на подот до него. Постави го стапалото на хартијата со петицата прислонета на ѕидот. Нацртај ја контурата со молив — почни од петицата и заокружи до прстите. Ако некој може да ти помогне, уште подобро.',
    sq: 'Qëndro pranë murit dhe vendos një fletë letër në dysheme pranë tij. Vendos këmbën mbi letër me thembrën të mbështetur në mur. Vizato konturin me laps — fillo nga thembra dhe rretho deri te gishtërinjtë. Nëse dikush mund të të ndihmojë, edhe më mirë.',
    en: 'Stand next to a wall and place a sheet of paper on the floor against it. Place your foot on the paper with your heel touching the wall. Trace the outline with a pencil — start at the heel and go all the way around. It\'s easier if someone helps.',
  },
  'sizeGuide.step3.title': {
    mk: '3. Држи го моливот вертикален',
    sq: '3. Mbaj lapsin vertikal',
    en: '3. Keep the pencil vertical',
  },
  'sizeGuide.step3.body': {
    mk: 'Ова е клучен детал: при цртањето, моливот мора да биде на 90° — право нагоре, не наклонет. Ако е наклонет, ќе го подцениш стапалото. Не цртај под стапалото. Двете нозе ретко се исти — измери ги двете и земи ја поголемата мерка.',
    sq: 'Ky është detaji kyç: gjatë vizatimit, lapsi duhet të jetë në 90° — drejt lart, jo i anuar. Nëse është i anuar, do të nënvlerësosh këmbën. Mos vizato nën këmbë. Të dy këmbët rrallë janë njësoj — mat të dyja dhe merr matjen më të madhe.',
    en: 'This is the key detail: while drawing, the pencil must be at 90° — straight up, not angled. An angled pencil will make your foot look smaller than it is. Don\'t draw under the foot. Both feet are rarely identical — measure both and use the larger one.',
  },
  'sizeGuide.step4.title': {
    mk: '4. Измери и додај простор',
    sq: '4. Mat dhe shto hapësirë',
    en: '4. Measure and add clearance',
  },
  'sizeGuide.step4.body': {
    mk: 'Измери ја должината на контурата во милиметри. Додај уште 5–10 mm за да не е тесно (зависно од личните преференции). Ако носиш дебели чорапи, земи ги предвид. Потоа провери ја табелата за големини на страницата на брендот за да го најдеш вистинскиот број.',
    sq: 'Mat gjatësinë e konturit në milimetra. Shto edhe 5–10 mm për t\'u siguruar se nuk është i ngushtë (sipas preferencave personale). Nëse mban çorape të trasha, merri parasysh. Pastaj shiko tabelën e madhësive në faqen e markës për të gjetur numrin e duhur.',
    en: 'Measure the length of the outline in millimetres. Add 5–10 mm to make sure the fit isn\'t tight (depending on personal preference). If you wear thick socks, factor that in too. Then check the brand\'s size chart to find your EU size.',
  },
  'sizeGuide.tip.title': {
    mk: 'Совет',
    sq: 'Këshillë',
    en: 'Tip',
  },
  'sizeGuide.tip.body': {
    mk: 'Мери ги стапалата навечер — се прошируваат во текот на денот. Носи ги чорапите во кои обично одиш со патики кога мериш.',
    sq: 'Mat këmbët në mbrëmje — ato zgjerohen gjatë ditës. Mbaj çorapet që zakonisht i mban me këpucë kur mat.',
    en: 'Measure your feet in the evening — they expand throughout the day. Wear the socks you usually use with shoes when measuring.',
  },
  'sizeGuide.brands.title': {
    mk: 'Табели за секој бренд',
    sq: 'Tabela për çdo markë',
    en: 'Per-brand size charts',
  },
  'sizeGuide.brands.lead': {
    mk: 'Секој бренд има свои мерки. На страницата на брендот ќе ја најдеш точната табела со должина на влошката или стапалото за секоја големина.',
    sq: 'Çdo markë ka matjet e veta. Në faqen e markës do të gjesh tabelën e saktë me gjatësinë e solës ose të këmbës për çdo madhësi.',
    en: 'Every brand has its own measurements. On each brand page you\'ll find the exact chart with insole or foot length for every size.',
  },
  'sizeGuide.help.title': {
    mk: 'Сѐ уште не си сигурен?',
    sq: 'Akoma nuk je i sigurt?',
    en: 'Still not sure?',
  },
  'sizeGuide.help.body': {
    mk: 'Пиши ни — ќе ти помогнеме лично. Имаме секој модел во раце и знаеме како им оди големината.',
    sq: 'Na shkruaj — do të të ndihmojmë personalisht. I kemi të gjitha modelet në duar dhe dimë si shkojnë me madhësinë.',
    en: 'Write to us — we\'ll help you personally. We have every model in our hands and know how they run on size.',
  },

  // ── Foot Health hub page ──────────────────────────────────
  'footHealth.eyebrow': {
    mk: 'Здравје на стапалата',
    sq: 'Shëndeti i këmbëve',
    en: 'Foot Health',
  },
  'footHealth.title': {
    mk: 'Стапалата заслужуваат подобро.',
    sq: 'Këmbët meritojnë më shumë.',
    en: 'Your feet deserve better.',
  },
  'footHealth.subtitle': {
    mk: 'Почни да разбираш зошто.',
    sq: 'Fillo të kuptosh pse.',
    en: 'Start learning why.',
  },
  // Topic card category labels
  'footHealth.topic.achilles': {
    mk: 'Ахилот и потколеници',
    sq: 'Akili dhe kërcinjtë',
    en: 'Achilles & calves',
  },
  'footHealth.topic.heel': {
    mk: 'Петица и свод',
    sq: 'Thembra dhe harku',
    en: 'Heel & arch',
  },
  'footHealth.topic.knees': {
    mk: 'Колена и грб',
    sq: 'Gjunjët dhe shpina',
    en: 'Knees & back',
  },
  'footHealth.topic.veins': {
    mk: 'Вени & циркулација',
    sq: 'Venat & qarkullimi',
    en: 'Veins & circulation',
  },
  'footHealth.topic.transition': {
    mk: 'Водич за транзиција',
    sq: 'Udhëzues tranzicioni',
    en: 'Transition guide',
  },
  // Dark CTA banner
  'footHealth.cta.title': {
    mk: 'Не си сигурен дали боси патики се за тебе?',
    sq: 'Nuk je i sigurt nëse këpucët barefoot janë për ty?',
    en: 'Not sure if barefoot shoes are for you?',
  },
  'footHealth.cta.body': {
    mk: 'Прочитај го нашиот целосен водич за почетници — бесплатно, без обврски.',
    sq: 'Lexo udhëzuesin tonë të plotë për fillestarë — falas, pa detyrime.',
    en: 'Read our complete beginner\'s guide — free, no strings attached.',
  },
  'footHealth.cta.button': {
    mk: 'Започни тука',
    sq: 'Fillo këtu',
    en: 'Start here',
  },
  // Symptoms / signs section
  'footHealth.signs.eyebrow': {
    mk: 'Дали те засегнува ова?',
    sq: 'A të prek kjo?',
    en: 'Does this affect you?',
  },
  'footHealth.signs.title': {
    mk: 'Препознај ги знаците на лоши обувки',
    sq: 'Njih shenjat e këpucëve të këqija',
    en: 'Recognise the signs of bad shoes',
  },
  'footHealth.signs.kneePain': {
    mk: 'Болка во колена',
    sq: 'Dhimbje në gjunjë',
    en: 'Knee pain',
  },
  'footHealth.signs.heavyLegs': {
    mk: 'Тешки нозе навечер',
    sq: 'Këmbë të rënda në mbrëmje',
    en: 'Heavy legs in the evening',
  },
  'footHealth.signs.heelPain': {
    mk: 'Болка во петицата',
    sq: 'Dhimbje në thembër',
    en: 'Heel pain',
  },
  'footHealth.signs.flatFeet': {
    mk: 'Плоско стопало',
    sq: 'Këmbë të sheshta',
    en: 'Flat feet',
  },
  'footHealth.signs.varicose': {
    mk: 'Варикозни вени',
    sq: 'Vena varikoze',
    en: 'Varicose veins',
  },
  'footHealth.signs.backPain': {
    mk: 'Болка во грб',
    sq: 'Dhimbje shpine',
    en: 'Back pain',
  },
  'footHealth.signs.bentToes': {
    mk: 'Искривени прсти',
    sq: 'Gishtërinj të shtrembër',
    en: 'Bent toes',
  },
  'footHealth.signs.swollenFeet': {
    mk: 'Отечени нозе',
    sq: 'Këmbë të fryra',
    en: 'Swollen feet',
  },
  'footHealth.signs.fatigue': {
    mk: 'Замор при одење',
    sq: 'Lodhje gjatë ecjes',
    en: 'Fatigue when walking',
  },
  'footHealth.signs.note': {
    mk: 'Ако препознаваш некој од овие симптоми — обувките можат да бидат причината.',
    sq: 'Nëse njeh ndonjë nga këto simptoma — këpucët mund të jenë shkaku.',
    en: 'If you recognise any of these symptoms — your shoes could be the cause.',
  },
  'footHealth.signs.link': {
    mk: 'Дознај повеќе за здравјето на стапалата',
    sq: 'Mëso më shumë për shëndetin e këmbëve',
    en: 'Learn more about foot health',
  },

  // ── New to barefoot page ──────────────────────────────────
  'newToBarefoot.title': {
    mk: 'Нови кај боси патики?',
    sq: 'Fillestare me këpucët barefoot?',
    en: 'New to barefoot shoes?',
  },
  'newToBarefoot.lead': {
    mk: 'Ако никогаш не си носел боси патики, оваа страница е за тебе. Ќе ти објасниме зошто се различни, зошто важи тоа и како безбедно да почнеш.',
    sq: 'Nëse nuk keni veshur kurrë këpucë barefoot, kjo faqe është për ju. Do të shpjegojmë pse janë të ndryshme, pse ka rëndësi dhe si të filloni në mënyrë të sigurt.',
    en: 'If you\'ve never worn barefoot shoes, this page is for you. We\'ll explain what makes them different, why it matters, and how to start safely.',
  },
  'newToBarefoot.what.title': {
    mk: 'Три работи кои ги прават поинакви',
    sq: 'Tre gjëra që i bëjnë të ndryshme',
    en: 'Three things that make them different',
  },
  'newToBarefoot.what.lead': {
    mk: 'Обична чевла го обликува стапалото. Боса чевла го ослободува. Разликата лежи во три основни карактеристики:',
    sq: 'Këpuca konvencionale e modelon këmbën. Këpuca barefoot e liron atë. Ndryshimi qëndron në tre karakteristika bazë:',
    en: 'A conventional shoe shapes your foot. A barefoot shoe frees it. The difference comes down to three features:',
  },
  'newToBarefoot.feature1.title': {
    mk: 'Широк простор за прстите',
    sq: 'Hapësirë e gjerë për gishtërinjtë',
    en: 'Wide toe box',
  },
  'newToBarefoot.feature1.body': {
    mk: 'Прстите треба простор да се распостелат. Тесна чевла ги стиска — со текот на времето тоа ја слабее мускулатурата и ги деформира прстите. Широкиот простор го враќа природниот облик на стапалото.',
    sq: 'Gishtërinjtë kanë nevojë për hapësirë të hapen. Këpuca e ngushtë i shtrydhë — me kalimin e kohës kjo dobëson muskulaturën dhe deformon gishtërinjtë. Hapësira e gjerë e kthen formën natyrale të këmbës.',
    en: 'Toes need room to splay. A narrow shoe squeezes them — over time this weakens the muscles and deforms the toes. A wide toe box returns the foot to its natural shape.',
  },
  'newToBarefoot.feature2.title': {
    mk: 'Нула надолен пад',
    sq: 'Zero drop',
    en: 'Zero drop',
  },
  'newToBarefoot.feature2.body': {
    mk: 'Кај обичните чевли петицата е повисока од прстите — тоа го скратува ахиловото тетиво и го наведнува телото нанапред. Кај босите патики петицата и прстите се на исто ниво, баш како кога одиш бос по рамна подлога.',
    sq: 'Tek këpucët normale thembra është më e lartë se gishtërinjtë — kjo shkurton tendinën e Akilit dhe anon trupin përpara. Tek barefoot thembra dhe gishtërinjtë janë në të njëjtin nivel, si kur ecni zbathur.',
    en: 'In regular shoes the heel is higher than the toes — this shortens the Achilles tendon and tilts the body forward. In barefoot shoes heel and toes are level, just like walking barefoot on a flat surface.',
  },
  'newToBarefoot.feature3.title': {
    mk: 'Тенок и флексибилен ѓон',
    sq: 'Sole e hollë dhe fleksibël',
    en: 'Thin flexible sole',
  },
  'newToBarefoot.feature3.body': {
    mk: 'Дебелата амортизација ги блокира сигналите кои стапалото ги испраќа кон мозокот. Тенкиот ѓон ти дозволува да ја чувствуваш подлогата — тоа се нарекува проприоцепција. Стапалото реагира природно, а со тоа и целото тело.',
    sq: 'Amortizimi i trashë bllokon sinjalet që këmba i dërgon trurit. Solla e hollë ju lejon të ndjeni tokën — kjo quhet proprioceptim. Këmba reagon natyrisht, dhe me të edhe i gjithë trupi.',
    en: 'Thick cushioning blocks the signals your foot sends to your brain. A thin sole lets you feel the ground — this is called proprioception. The foot responds naturally, and so does the rest of your body.',
  },
  'newToBarefoot.transition.title': {
    mk: 'Како да преминеш безбедно',
    sq: 'Si të kalosh në mënyrë të sigurt',
    en: 'How to transition safely',
  },
  'newToBarefoot.transition.lead': {
    mk: 'Ова е најважното нешто кое треба да го знаеш: не можеш само да ги обуеш и да продолжиш со вообичаениот распоред. Стапалата и мускулите на нозете биле во обични чевли со години — потребно е време да се зајакнат.',
    sq: 'Kjo është gjëja më e rëndësishme: nuk mund t\'i vishni dhe të vazhdoni me rutinën normale. Këmbët dhe muskujt kanë qenë në këpucë normale për vite — duhet kohë për t\'u forcuar.',
    en: 'This is the most important thing to know: you can\'t just put them on and carry on with your normal routine. Your feet and lower leg muscles have been in conventional shoes for years — they need time to strengthen.',
  },
  'newToBarefoot.transition.week1.title': {
    mk: 'Недели 1–2: Полека почни',
    sq: 'Javët 1–2: Fillo ngadalë',
    en: 'Weeks 1–2: Start slowly',
  },
  'newToBarefoot.transition.week1.body': {
    mk: 'Носи ги 1–2 часа дневно за секојдневни активности — одење, работа. Не трчај. Дај им на мускулите да се навикнат на новото оптоварување. Замор или болка е знак дека правиш повеќе отколку треба.',
    sq: 'Vishini 1–2 orë në ditë për aktivitete të përditshme — ecje, punë. Mos vraponi. Lërini muskujt të mësohen. Lodhja ose dhimbja është shenjë se po bëni shumë.',
    en: 'Wear them 1–2 hours a day for everyday activities — walking, errands. Don\'t run. Let your muscles adapt. Fatigue or soreness means you\'re doing too much.',
  },
  'newToBarefoot.transition.week3.title': {
    mk: 'Недели 3–4: Зголеми постепено',
    sq: 'Javët 3–4: Rrit gradualisht',
    en: 'Weeks 3–4: Build gradually',
  },
  'newToBarefoot.transition.week3.body': {
    mk: 'Ако се чувствуваш добро, зголеми на 3–4 часа. Вклучи ги и на кратки прошетки. Мускулите на стапалото и потколеницата веројатно ќе бидат малку занемарени — тоа е нормално и добро.',
    sq: 'Nëse ndjeheni mirë, rritni në 3–4 orë. Përfshijini edhe në shëtitje të shkurtra. Muskujt e këmbës dhe viçit do të jenë pak të lodhur — kjo është normale dhe e mirë.',
    en: 'If you feel good, increase to 3–4 hours. Include them on short walks. Foot and calf muscles will probably be a little sore — that\'s normal and a good sign.',
  },
  'newToBarefoot.transition.month2.title': {
    mk: 'Месец 2+: Стапалото почнува да се менува',
    sq: 'Muaji 2+: Këmba fillon të ndryshojë',
    en: 'Month 2+: Your foot starts to change',
  },
  'newToBarefoot.transition.month2.body': {
    mk: 'Постепено ги заменуваш обичните чевли во сè повеќе ситуации. Стапалата стануваат посилни, ходот е постабилен. Многу луѓе забележуваат дека болките во колената и грбот се намалуваат.',
    sq: 'Gradualisht i zëvendësoni këpucët normale në situata gjithnjë e më shumë. Këmbët bëhen më të forta, ecja më e qëndrueshme. Shumë njerëz vërejnë se dhimbjet në gjunjë dhe shpinë zvogëlohen.',
    en: 'You gradually replace conventional shoes in more situations. Feet get stronger, gait more stable. Many people notice knee and back pain decreasing.',
  },
  'newToBarefoot.mistakes.title': {
    mk: 'Чести грешки',
    sq: 'Gabimet e zakonshme',
    en: 'Common mistakes',
  },
  'newToBarefoot.mistake1.title': {
    mk: 'Прекумерно носење на почетокот',
    sq: 'Mbarveshje e tepërt në fillim',
    en: 'Overdoing it at the start',
  },
  'newToBarefoot.mistake1.body': {
    mk: 'Болките по првата недела речиси секогаш значат едно: премногу, премногу брзо. Два часа дневно е доволно за почеток.',
    sq: 'Dhimbjet pas javës së parë pothuajse gjithmonë nënkuptojnë: shumë, shumë shpejt. Dy orë në ditë janë të mjaftueshme.',
    en: 'Soreness after the first week almost always means: too much, too fast. Two hours a day is enough to start.',
  },
  'newToBarefoot.mistake2.title': {
    mk: 'Трчање пред одење',
    sq: 'Vrapim para ecjes',
    en: 'Running before walking',
  },
  'newToBarefoot.mistake2.body': {
    mk: 'Боси трчање е напреден чекор. Прво зајакни ги стапалата со одење. Трчањето може да почне по 2–3 месеци, постепено и внимателно.',
    sq: 'Vrapimi barefoot është hap i avancuar. Fillimisht forconi këmbët me ecje. Vrapimi mund të fillojë pas 2–3 muajsh, gradualisht.',
    en: 'Barefoot running is an advanced step. First strengthen your feet with walking. Running can begin after 2–3 months, gradually and carefully.',
  },
  'newToBarefoot.mistake3.title': {
    mk: 'Очекување брзи резултати',
    sq: 'Pritshmëri për rezultate të shpejta',
    en: 'Expecting quick results',
  },
  'newToBarefoot.mistake3.body': {
    mk: 'Транзицијата трае месеци. Телото не се адаптира преку ноќ. Стрпливоста е дел од процесот — тело кое постепено се менува е потрајно од она кое брза.',
    sq: 'Tranzicioni zgjat muaj. Trupi nuk adaptohet gjatë natës. Durimi është pjesë e procesit — ndryshimi gradual zgjat më shumë.',
    en: 'Transition takes months. The body doesn\'t adapt overnight. Patience is part of the process — gradual change lasts longer than rushing.',
  },
  'newToBarefoot.faq.title': {
    mk: 'Чести прашања',
    sq: 'Pyetje të shpeshta',
    en: 'Frequently asked questions',
  },
  'newToBarefoot.faq.1.q': {
    mk: 'Дали босите патики се погодни за сите?',
    sq: 'A janë këpucët barefoot të përshtatshme për të gjithë?',
    en: 'Are barefoot shoes suitable for everyone?',
  },
  'newToBarefoot.faq.1.a': {
    mk: 'Речиси за секого — но транзицијата мора да биде постепена. Ако имаш специфични медицински состојби на стапалото, консултирај се со специјалист пред да почнеш.',
    sq: 'Pothuajse për të gjithë — por tranzicioni duhet të jetë gradual. Nëse keni kushte mjekësore specifike, konsultohuni me specialist.',
    en: 'For almost everyone — but the transition must be gradual. If you have specific medical foot conditions, consult a specialist before starting.',
  },
  'newToBarefoot.faq.2.q': {
    mk: 'Дали ќе ме болат стапалата?',
    sq: 'A do të më dhembin këmbët?',
    en: 'Will my feet hurt?',
  },
  'newToBarefoot.faq.2.a': {
    mk: 'Лесна мускулна болка на почетокот е нормална — мускулите работат на нов начин. Остра болка значи дека треба да запреш. Постепена транзиција го минимизира ова.',
    sq: 'Dhimbje e lehtë muskulore në fillim është normale. Dhimbja e mprehtë nënkupton se duhet të ndaloni. Tranzicioni gradual e minimizon këtë.',
    en: 'Mild muscle soreness at the start is normal — muscles are working in a new way. Sharp pain means you should stop. A gradual transition minimises this.',
  },
  'newToBarefoot.faq.3.q': {
    mk: 'Кога можам да почнам да трчам?',
    sq: 'Kur mund të filloj të vrapoj?',
    en: 'When can I start running in them?',
  },
  'newToBarefoot.faq.3.a': {
    mk: 'По 2–3 месеци на редовно носење за одење. Почни со кратки интервали (5–10 минути) и зголемувај постепено. Некои чекаат 6 месеци — и тоа е во ред.',
    sq: 'Pas 2–3 muajsh të veshjeve të rregullta për ecje. Filloni me intervale të shkurtra (5–10 minuta) dhe rritni gradualisht.',
    en: 'After 2–3 months of regular walking use. Start with short intervals (5–10 minutes) and build gradually. Some people wait 6 months — that\'s fine too.',
  },
  'newToBarefoot.faq.4.q': {
    mk: 'Можам ли да ги носам на работа?',
    sq: 'A mund t\'i mbaj në punë?',
    en: 'Can I wear them to work?',
  },
  'newToBarefoot.faq.4.a': {
    mk: 'Да — но примени ги истите правила. Ако работиш стоечки 8 часа, почни со неколку часа и постепено зголемувај.',
    sq: 'Po — por zbatoni të njëjtat rregulla. Nëse punoni në këmbë 8 orë, filloni me disa orë dhe rritni gradualisht.',
    en: 'Yes — but apply the same gradual rules. If you stand for 8 hours at work, start with a few hours and build up.',
  },
  'newToBarefoot.cta.title': {
    mk: 'Готов да почнеш?',
    sq: 'Gati të fillosh?',
    en: 'Ready to start?',
  },
  'newToBarefoot.cta.body': {
    mk: 'Секоја патика во нашата продавница ја покажува дебелината на ѓонот, надолниот пад и ширината на просторот за прстите. Не си сигурен која? Пиши ни — ние лично ги носиме сите модели кои ги нудиме.',
    sq: 'Çdo këpucë tregon trashësinë e solës, drop-in dhe gjerësinë e hapësirës për gishtërinjtë. Nuk jeni të sigurt cilën? Na shkruani — ne i mbajmë personalisht të gjitha modelet.',
    en: 'Every shoe in our store shows sole thickness, drop, and toe box width. Not sure which one? Write to us — we personally wear every model we stock.',
  },
  // ── About page ────────────────────────────────────────────
  'about.title': {
    mk: 'За нас',
    sq: 'Rreth nesh',
    en: 'About us',
  },
  'about.lead': {
    mk: 'Bosfoot е првата специјализирана продавница за боси патики на Балканот. Веруваме дека стапалата заслужуваат подобро.',
    sq: 'Bosfoot është dyqani i parë i specializuar i këpucëve barefoot në Ballkan. Besojmë se këmbët meritojnë më shumë.',
    en: 'Bosfoot is the first dedicated barefoot shoe shop in the Balkans. We believe feet deserve better.',
  },
  'about.story.title': {
    mk: 'Нашата приказна',
    sq: 'Historia jonë',
    en: 'Our story',
  },
  'about.story.body': {
    mk: 'Сѐ почна со едно прашање: зошто на Балканот толку тешко се наоѓаат квалитетни боси патики? Откако години пробавме брендови од странство, решивме да ја донесеме селекцијата овде — со грижа за квалитет, со совет што се добива само од лични искуства.',
    sq: 'Gjithçka filloi me një pyetje: pse në Ballkan është kaq e vështirë të gjesh këpucë barefoot të cilësisë? Pasi provuam marka nga jashtë për vite, vendosëm ta sjellim përzgjedhjen këtu — me kujdes për cilësinë, me këshilla që vijnë vetëm nga përvoja personale.',
    en: 'It all started with one question: why is it so hard to find quality barefoot shoes in the Balkans? After years of trying brands from abroad, we decided to bring the selection here — with care for quality, with advice that only comes from personal experience.',
  },
  'about.mission.title': {
    mk: 'Нашата мисија',
    sq: 'Misioni ynë',
    en: 'Our mission',
  },
  'about.mission.body': {
    mk: 'Да ги вратиме стапалата на местото каде што природата ги има замислено — слободни, силни, чувствителни. Со лично избрани брендови од Европа, локална поддршка и совет од прва рака.',
    sq: 'T\'i kthejmë këmbët në vendin ku natyra i ka projektuar — të lira, të forta, të ndjeshme. Me marka të zgjedhura personalisht nga Europa, mbështetje lokale dhe këshilla nga dora e parë.',
    en: 'To return feet to the place nature designed them — free, strong, sensitive. With personally selected brands from Europe, local support and first-hand advice.',
  },
  'about.values.title': {
    mk: 'Што нѐ води',
    sq: 'Çfarë na udhëheq',
    en: 'What guides us',
  },
  'about.values.1.title': {
    mk: 'Квалитет пред количина',
    sq: 'Cilësi mbi sasi',
    en: 'Quality over quantity',
  },
  'about.values.1.body': {
    mk: 'Не продаваме сѐ. Ја избираме селекцијата лично, бренд по бренд, модел по модел.',
    sq: 'Nuk shesim gjithçka. E zgjedhim përzgjedhjen personalisht, markë pas marke, model pas modeli.',
    en: 'We don\'t sell everything. We curate the selection personally, brand by brand, model by model.',
  },
  'about.values.2.title': {
    mk: 'Транспарентност',
    sq: 'Transparencë',
    en: 'Transparency',
  },
  'about.values.2.body': {
    mk: 'Спецификации, потекло, материјали — сѐ е јасно напишано. Без скривени детали.',
    sq: 'Specifikime, origjinë, materiale — gjithçka është e shkruar qartë. Pa detaje të fshehura.',
    en: 'Specs, origin, materials — everything is clearly written. No hidden details.',
  },
  'about.values.3.title': {
    mk: 'Близина',
    sq: 'Afërsi',
    en: 'Closeness',
  },
  'about.values.3.body': {
    mk: 'Локален тим, локална испорака, локален разговор. Ни се обраќаш — ти одговараме лично.',
    sq: 'Ekip lokal, dërgim lokal, bisedë lokale. Na drejtohesh — ne të përgjigjemi personalisht.',
    en: 'Local team, local delivery, local conversation. You reach out — we answer personally.',
  },
  'about.contact.title': {
    mk: 'Контакт',
    sq: 'Kontakt',
    en: 'Get in touch',
  },
  'about.contact.body': {
    mk: 'Имаш прашање за големина, бренд или нарачка? Пиши ни — одговараме брзо.',
    sq: 'Ke pyetje për madhësinë, markën apo porosinë? Na shkruaj — përgjigjemi shpejt.',
    en: 'Got a question about sizing, a brand, or an order? Write to us — we reply fast.',
  },
  'about.placeholder': {
    mk: '[Замени со твој текст]',
    sq: '[Zëvendëso me tekstin tënd]',
    en: '[Replace with your own copy]',
  },

  // ── Search ────────────────────────────────────────────────
  'search.title': {
    mk: 'Пребарување',
    sq: 'Kërkim',
    en: 'Search',
  },
  'search.placeholder': {
    mk: 'Барај производ или бренд…',
    sq: 'Kërko produkt ose markë…',
    en: 'Search products or brands…',
  },
  'search.hint': {
    mk: 'Внеси барем 2 знаци за да видиш резултати.',
    sq: 'Shkruaj të paktën 2 shkronja për të parë rezultatet.',
    en: 'Type at least 2 characters to see results.',
  },
  'search.empty': {
    mk: 'Нема резултати. Пробај поинаков збор.',
    sq: 'Asnjë rezultat. Provo një fjalë tjetër.',
    en: 'No results. Try a different word.',
  },
  'search.loading': {
    mk: 'Се вчитува…',
    sq: 'Po ngarkohet…',
    en: 'Loading…',
  },

  // ── Legal / trust pages (shared) ──────────────────────────
  'legal.lastUpdated': {
    mk: 'Последно ажурирање',
    sq: 'Përditësimi i fundit',
    en: 'Last updated',
  },
  'legal.placeholder': {
    mk: 'Овој текст е placeholder. Замени го со финална правна верзија пред lansiranje.',
    sq: 'Ky tekst është vendmbajtës. Zëvendëso me versionin final ligjor para lansimit.',
    en: 'This text is a placeholder. Replace with the final legal copy before launch.',
  },
  'legal.contactCta': {
    mk: 'Прашања? Пиши ни на',
    sq: 'Pyetje? Na shkruaj në',
    en: 'Questions? Email us at',
  },

  // Privacy policy
  'nav.privacy': {
    mk: 'Политика на приватност',
    sq: 'Politika e privatësisë',
    en: 'Privacy policy',
  },
  'privacy.title': {
    mk: 'Политика на приватност',
    sq: 'Politika e privatësisë',
    en: 'Privacy policy',
  },
  'privacy.lead': {
    mk: 'Како ги собираме, користиме и заштитуваме твоите лични податоци.',
    sq: 'Si i mbledhim, përdorim dhe mbrojmë të dhënat tuaja personale.',
    en: 'How we collect, use and protect your personal data.',
  },
  'privacy.1.title': {
    mk: 'Кои податоци ги собираме',
    sq: 'Të dhënat që mbledhim',
    en: 'What data we collect',
  },
  'privacy.1.body': {
    mk: 'Кога нарачуваш, собираме име, адреса, е-пошта, телефон. Кога посетуваш сајт — анонимни статистики за посета (без cookies за рекламирање).',
    sq: 'Kur porosit, mbledhim emër, adresë, email, telefon. Kur viziton sajtin — statistika anonime vizite (pa cookies reklamuese).',
    en: 'When you order we collect name, address, email, phone. When you browse we collect anonymous visit stats (no advertising cookies).',
  },
  'privacy.2.title': {
    mk: 'Како ги користиме',
    sq: 'Si i përdorim',
    en: 'How we use them',
  },
  'privacy.2.body': {
    mk: 'Само за исполнување на нарачката, известувања за статусот и одговори на твоите прашања. Не продаваме податоци на трети лица.',
    sq: 'Vetëm për përmbushjen e porosisë, njoftime statusi dhe përgjigje për pyetjet tuaja. Nuk shesim të dhëna te palë të treta.',
    en: 'Only to fulfill your order, send status updates and answer your questions. We don\'t sell data to third parties.',
  },
  'privacy.3.title': {
    mk: 'Твоите права',
    sq: 'Të drejtat tuaja',
    en: 'Your rights',
  },
  'privacy.3.body': {
    mk: 'Можеш да побараш увид, исправка или бришење на твоите податоци во кое било време. Пиши ни и одговараме во рок од 30 дена.',
    sq: 'Mund të kërkoni qasje, korrigjim ose fshirje të të dhënave tuaja në çdo kohë. Na shkruani dhe përgjigjemi brenda 30 ditëve.',
    en: 'You can request access, correction or deletion of your data at any time. Write to us and we respond within 30 days.',
  },

  // Terms of sale
  'nav.terms': {
    mk: 'Услови на продажба',
    sq: 'Kushtet e shitjes',
    en: 'Terms of sale',
  },
  'terms.title': {
    mk: 'Услови на продажба',
    sq: 'Kushtet e shitjes',
    en: 'Terms of sale',
  },
  'terms.lead': {
    mk: 'Условите според кои ги продаваме нашите производи.',
    sq: 'Kushtet sipas të cilave shesim produktet tona.',
    en: 'The terms under which we sell our products.',
  },
  'terms.1.title': {
    mk: 'Цени и плаќање',
    sq: 'Çmimet dhe pagesa',
    en: 'Prices and payment',
  },
  'terms.1.body': {
    mk: 'Сите цени се во MKD и ги вклучуваат сите даноци. Плаќањето е при испорака (готовина) или со банкарски трансфер по нарачка.',
    sq: 'Të gjitha çmimet janë në MKD dhe përfshijnë të gjitha taksat. Pagesa është me dorëzim (kesh) ose transfer bankar pas porosisë.',
    en: 'All prices are in MKD and include all taxes. Payment is on delivery (cash) or bank transfer after order.',
  },
  'terms.2.title': {
    mk: 'Достапност',
    sq: 'Disponueshmëria',
    en: 'Availability',
  },
  'terms.2.body': {
    mk: 'Производите се на залиха додека трае. Доколку производ не е достапен по нарачка, веднаш те контактираме и нудиме повраток или замена.',
    sq: 'Produktet janë në stok sa zgjatin. Nëse një produkt nuk është i disponueshëm pas porosisë, ju kontaktojmë menjëherë dhe ofrojmë rimbursim ose zëvendësim.',
    en: 'Products are in stock while supplies last. If an item is unavailable after ordering we contact you immediately and offer refund or replacement.',
  },
  'terms.3.title': {
    mk: 'Договор',
    sq: 'Kontrata',
    en: 'Contract',
  },
  'terms.3.body': {
    mk: 'Договорот за продажба се склучува кога ќе ја потврдиме нарачката по електронска пошта.',
    sq: 'Kontrata e shitjes lidhet kur konfirmojmë porosinë me email.',
    en: 'The sale contract is concluded when we confirm your order by email.',
  },

  // Returns
  'nav.returns': {
    mk: 'Враќање',
    sq: 'Kthimi',
    en: 'Returns',
  },
  'returns.title': {
    mk: 'Враќање и замена',
    sq: 'Kthimi dhe zëvendësimi',
    en: 'Returns & exchanges',
  },
  'returns.lead': {
    mk: 'Не ти одговара? Имаш 30 дена да ги вратиш без прашања.',
    sq: 'Nuk të përshtatet? Ke 30 ditë t\'i kthesh pa pyetje.',
    en: 'Doesn\'t fit? You have 30 days to return — no questions asked.',
  },
  'returns.1.title': {
    mk: '30 дена за враќање',
    sq: '30 ditë për kthim',
    en: '30-day return window',
  },
  'returns.1.body': {
    mk: 'Од денот кога ќе ја примиш пратката имаш 30 дена да ја вратиш. Производот мора да биде во оригинална состојба, со етикети, во оригиналната кутија.',
    sq: 'Nga dita kur merr paketën ke 30 ditë t\'i kthesh. Produkti duhet të jetë në gjendje origjinale, me etiketa, në kutinë origjinale.',
    en: 'From the day you receive the package you have 30 days to return. The product must be in original condition, with tags, in the original box.',
  },
  'returns.2.title': {
    mk: 'Како да вратиш',
    sq: 'Si të kthesh',
    en: 'How to return',
  },
  'returns.2.body': {
    mk: 'Пиши ни на е-пошта со број на нарачка. Праќаме упатства и адреса. Ти ја покриваш испораката за враќање; ние ги покриваме сите други трошоци.',
    sq: 'Na shkruaj me numrin e porosisë. Dërgojmë udhëzimet dhe adresën. Ti mbulon transportin e kthimit; ne mbulojmë gjithçka tjetër.',
    en: 'Email us with your order number. We send instructions and address. You cover return shipping; we cover everything else.',
  },
  'returns.3.title': {
    mk: 'Поврат на парите',
    sq: 'Rimbursimi',
    en: 'Refund',
  },
  'returns.3.body': {
    mk: 'По примање и преглед на производот, парите ги враќаме во рок од 5 работни дена на твојата сметка.',
    sq: 'Pas marrjes dhe kontrollit të produktit, paratë i kthejmë brenda 5 ditëve pune në llogarinë tënde.',
    en: 'After receiving and checking the product we refund within 5 business days to your account.',
  },

  // Shipping
  'nav.shipping': {
    mk: 'Достава',
    sq: 'Dërgimi',
    en: 'Shipping',
  },
  'shipping.title': {
    mk: 'Достава',
    sq: 'Dërgimi',
    en: 'Shipping',
  },
  'shipping.lead': {
    mk: 'Брза испорака низ Балканот со проверени курири.',
    sq: 'Dërgim i shpejtë në Ballkan me korrierë të besueshëm.',
    en: 'Fast shipping across the Balkans with trusted couriers.',
  },
  'shipping.1.title': {
    mk: 'Време на испорака',
    sq: 'Koha e dërgimit',
    en: 'Delivery time',
  },
  'shipping.1.body': {
    mk: 'Северна Македонија: 1-3 работни дена. Албанија, Косово, Србија: 3-5 дена. Останат Балкан: 4-7 дена.',
    sq: 'Maqedonia e Veriut: 1-3 ditë pune. Shqipëria, Kosova, Serbia: 3-5 ditë. Pjesa tjetër e Ballkanit: 4-7 ditë.',
    en: 'North Macedonia: 1-3 business days. Albania, Kosovo, Serbia: 3-5 days. Rest of Balkans: 4-7 days.',
  },
  'shipping.2.title': {
    mk: 'Цени',
    sq: 'Çmimet',
    en: 'Pricing',
  },
  'shipping.2.body': {
    mk: 'Бесплатна испорака за нарачки над 3000 MKD во рамките на Северна Македонија. Останати зони имаат фиксна цена која се пресметува при достава.',
    sq: 'Dërgim falas për porosi mbi 3000 MKD brenda Maqedonisë së Veriut. Zonat e tjera kanë çmim fiks që llogaritet në arkë.',
    en: 'Free shipping on orders over 3000 MKD within North Macedonia. Other zones have a flat rate calculated at checkout.',
  },
  'shipping.3.title': {
    mk: 'Следење',
    sq: 'Gjurmimi',
    en: 'Tracking',
  },
  'shipping.3.body': {
    mk: 'По нарачката добиваш потврда со tracking број. Можеш да ја следиш пратката на сајтот на нашиот курир.',
    sq: 'Pas porosisë merr konfirmim me numër gjurmimi. Mund të ndjekësh paketën në faqen e korrierit tonë.',
    en: 'After ordering you receive a confirmation with a tracking number. You can follow the package on our courier\'s website.',
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
 * Format a price as separate parts so the UI can stack EUR below MKD.
 *
 * On `mk` locale (or non-MKD currency): only `primary` is set.
 * On `sq` / `en` locale: `primary` is MKD, `secondary` is the EUR equivalent.
 *
 * Components render this via `<Price>` / `<Price.astro>`. For strings that
 * must stay inline (alt text, structured data), use `formatPrice` below.
 */
export function formatPriceParts(
  amount: number,
  locale: Locale,
  currency = 'MKD',
): { primary: string; secondary?: string } {
  const primary = `${formatInt(amount)} ${t(`currency.${currency}`, locale)}`
  if (locale === 'mk' || currency !== 'MKD') {
    return { primary }
  }
  const eurAmount = amount / MKD_PER_EUR
  return { primary, secondary: `${formatTwoDecimals(eurAmount)} €` }
}

/**
 * Single-string price formatter — kept for non-UI uses (structured data,
 * alt text, plain-text contexts). UI surfaces should use <Price> instead.
 *
 * On `mk` locale: just MKD, e.g. `7 500 ден`
 * On `sq` / `en` locale: MKD with EUR in brackets, e.g. `7 500 ден (122.00 €)`
 */
export function formatPrice(amount: number, locale: Locale, currency = 'MKD'): string {
  const { primary, secondary } = formatPriceParts(amount, locale, currency)
  return secondary ? `${primary} (${secondary})` : primary
}