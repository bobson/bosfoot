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
  articles: { mk: 'articles', sq: 'articles', en: 'articles' },
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
    mk: 'Премиум боси патики за оние кои сакаат природен чекор. Курирани од европските мајстори на занаетот.',
    sq: 'Këpucë barefoot premium për ata që duan një hap natyral. Të zgjedhura nga mjeshtrit evropianë.',
    en: 'Premium barefoot shoes for people who want a natural step. Curated from European masters of the craft.',
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
    mk: 'Курирана селекција',
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