/**
 * Bosfoot article seeder.
 *
 * Usage:
 *   pnpm articles          Dry run — print what would happen, no writes
 *   pnpm articles:apply    Apply changes to Sanity
 *
 * Idempotent: each article has a stable _id derived from its English slug,
 * so re-running updates the existing document instead of creating a duplicate.
 * Cover images are NOT seeded — add them manually in Studio after seeding.
 */

import { client, sanityProjectInfo } from './sanity.js'

const APPLY = process.argv.includes('--apply')

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

// ─── Portable Text helpers ────────────────────────────────────────────
type Span = { _type: 'span'; _key: string; text: string; marks: string[] }
type Block = {
  _type: 'block'
  _key: string
  style: 'normal' | 'h2' | 'h3'
  markDefs: []
  children: Span[]
}

function p(key: string, text: string): Block {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
  }
}

function h(key: string, text: string, level: 2 | 3 = 3): Block {
  return {
    _type: 'block',
    _key: key,
    style: `h${level}` as 'h2' | 'h3',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
  }
}

// ─── Article content ──────────────────────────────────────────────────
type LocaleString = { mk: string; sq: string; en: string }
type ArticleSeed = {
  id: string // stable slug-like key; used in _id and as fallback
  slugs: LocaleString
  title: LocaleString
  lead: LocaleString
  author: string
  publishedAt: string // ISO date
  featured: boolean
  body_mk: Block[]
  body_sq: Block[]
  body_en: Block[]
}

const articles: ArticleSeed[] = [
  // ─── Article 1: First 60 days ──────────────────────────────────────
  {
    id: 'first-60-days',
    slugs: {
      mk: 'prvite-60-dena-vo-bosi-patiki',
      sq: '60-ditet-e-para-ne-kepuce-barefoot',
      en: 'your-first-60-days-in-barefoot-shoes',
    },
    title: {
      mk: 'Првите 60 дена во боси патики',
      sq: '60 ditët e tua të para në këpucë barefoot',
      en: 'Your first 60 days in barefoot shoes',
    },
    lead: {
      mk: 'Преминот кон боси патики не е прекинувач — тоа е бавно будење на мускули кои спијат со децении. Еве што да очекуваш, недела по недела.',
      sq: 'Kalimi në barefoot nuk është një çelës — është një rizgjim i ngadaltë i muskujve që kanë qenë në gjumë me dekada. Ja çfarë të presësh, javë pas jave.',
      en: 'Going barefoot isn’t a switch — it’s a slow rewiring of muscles that have been asleep for decades. Here’s what to expect, week by week.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-15T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a1-mk-1', 'Првата прошетка во боси патики е чудна, понекогаш и непријатна. Тоа не е грешка во патиките — тоа е твоето тело кое се буди. Стапалата ти биле затворени во преобликувани форми со години, а сега за прв пат можат да дишат, да се распостелат и да чувствуваат.'),
      h('a1-mk-h1', 'Недела 1–2: само одење, само рамно'),
      p('a1-mk-2', 'Започни со еден до два часа дневно, на рамна површина. Не трчај. Не качувај се по стрмнини. Само оди. Целта не е да исполниш чекори — целта е телото бавно да го прифати новиот начин на стоење и движење.'),
      h('a1-mk-h2', 'Недела 3–4: половина ден'),
      p('a1-mk-3', 'Сега патиките може да ги носиш половина ден. Очекувај замор во потколениците и сводот на стапалото. Тоа е добар знак — тие мускули прв пат работат како што треба. Ако нешто остро боли, застани и врати се на пократки сесии.'),
      h('a1-mk-h3', 'Недела 5–8: цел ден'),
      p('a1-mk-4', 'Кон крајот на вториот месец, повеќето луѓе можат да носат боси патики цел ден без специјална мисла. Може да започнеш и краток трк, но почни со 5 минути и постепено зголемувај.'),
      h('a1-mk-h4', 'На што да внимаваш'),
      p('a1-mk-5', 'Тапа болка во сводот или потколениците е нормална — тоа е јакнење. Остра болка во петицата, во горниот дел на стапалото или во коленото е сигнал да забавиш. Слушни го телото; нема рок.'),
      p('a1-mk-6', 'Наградата за стрпливост е чекор кој повторно чувствуваш како свој. Подобра рамнотежа, посилни стапала, и тивката увереност дека секој чекор е твој.'),
    ],
    body_sq: [
      p('a1-sq-1', 'Shëtitja e parë me këpucë barefoot është e çuditshme, ndonjëherë edhe e pakëndshme. Kjo nuk është një gabim i këpucëve — është trupi yt që po zgjohet. Këmbët kanë qenë të mbyllura në forma të rimodeluara me vite, dhe tani për herë të parë mund të marrin frymë, të hapen dhe të ndjejnë.'),
      h('a1-sq-h1', 'Java 1–2: vetëm ecje, vetëm sipërfaqe të rrafshëta'),
      p('a1-sq-2', 'Fillo me një deri në dy orë në ditë, në sipërfaqe të rrafshët. Mos vrapo. Mos ngjit shpate. Vetëm ec. Qëllimi nuk është të plotësosh hapa — qëllimi është që trupi të pranojë ngadalë mënyrën e re të qëndrimit dhe lëvizjes.'),
      h('a1-sq-h2', 'Java 3–4: gjysmë dite'),
      p('a1-sq-3', 'Tani mund t’i mbash këpucët gjysmë dite. Prit lodhje në kërcinjtë dhe harkun e këmbës. Kjo është një shenjë e mirë — ata muskuj po punojnë për herë të parë siç duhet. Nëse ka dhimbje të mprehtë, ndalo dhe kthehu te sesionet më të shkurtra.'),
      h('a1-sq-h3', 'Java 5–8: gjithë ditën'),
      p('a1-sq-4', 'Drejt fundit të muajit të dytë, shumica e njerëzve mund t’i mbajnë këpucët barefoot tërë ditën pa menduar veçanërisht. Mund të fillosh edhe një vrapim të shkurtër, por nis me 5 minuta dhe rrit gradualisht.'),
      h('a1-sq-h4', 'Çfarë të shikosh'),
      p('a1-sq-5', 'Dhimbje e topitur në hark ose në kërcinjtë është normale — është forcim. Dhimbje e mprehtë në thembër, në pjesën e sipërme të këmbës ose në gju është një sinjal për të ngadalësuar. Dëgjo trupin; nuk ka afat.'),
      p('a1-sq-6', 'Shpërblimi për durimin është një hap që e ndjen sërish si të tuajin. Ekuilibër më i mirë, këmbë më të forta dhe siguria e qetë se çdo hap është yti.'),
    ],
    body_en: [
      p('a1-en-1', 'Your first walk in barefoot shoes feels strange, sometimes uncomfortable. That isn’t a flaw in the shoes — it’s your body waking up. Your feet have been held in reshaped forms for years, and now, for the first time, they can breathe, splay, and feel.'),
      h('a1-en-h1', 'Week 1–2: walking only, flat ground only'),
      p('a1-en-2', 'Start with one to two hours a day on flat surfaces. Don’t run. Don’t take hills. Just walk. The point isn’t to log steps — the point is to let the body slowly accept a new way of standing and moving.'),
      h('a1-en-h2', 'Week 3–4: half-day wear'),
      p('a1-en-3', 'Now you can wear the shoes for half a day. Expect fatigue in your calves and arches. That is a good sign — those muscles are doing their job properly for the first time. If anything sharply hurts, back off and return to shorter sessions.'),
      h('a1-en-h3', 'Week 5–8: full days'),
      p('a1-en-4', 'By the end of the second month, most people can wear barefoot shoes all day without thinking about it. You can begin short runs, but start at five minutes and build up.'),
      h('a1-en-h4', 'What to watch for'),
      p('a1-en-5', 'Dull soreness in the arch or calves is normal — it’s strengthening. Sharp pain in the heel, top of the foot, or knee is a signal to slow down. Listen to your body; there is no deadline.'),
      p('a1-en-6', 'The reward for patience is a step that feels like yours again. Better balance, stronger feet, and the quiet certainty that every step is your own.'),
    ],
  },

  // ─── Article 2: Wide toe box ───────────────────────────────────────
  {
    id: 'wide-toe-box',
    slugs: {
      mk: 'shirokata-predna-strana-zoshto-e-vazhna',
      sq: 'maja-e-gjere-pse-ka-rendesi',
      en: 'the-wide-toe-box-and-why-it-matters',
    },
    title: {
      mk: 'Широката предна страна — и зошто е важна',
      sq: 'Maja e gjerë — dhe pse ka rëndësi',
      en: 'The wide toe box — and why it matters',
    },
    lead: {
      mk: 'Конвенционалните чевли ги стискаат петте прсти во форма на солза. Стапалото е граден поинаку.',
      sq: 'Këpucët konvencionale shtrydhin pesë gishtërinjtë në formën e një loti. Këmba juaj është ndërtuar ndryshe.',
      en: 'Conventional shoes squeeze five toes into the shape of a teardrop. Your foot was built differently.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-16T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a2-mk-1', 'Кога ќе го стартуваш стапалото на лист хартија и ќе ја црташ контурата, ќе видиш нешто едноставно: стапалото е најшироко на врвовите на прстите, не во основата. Сега погледни ги повеќето чевли од твојот плакар — речиси сите се стеснуваат напред. Резултатот: прстите се туркаат еден во друг.'),
      h('a2-mk-h1', 'Што се случува со децении на стискање'),
      p('a2-mk-2', 'Шуплината (булент), искривениот палец, „ковано“ прсте — тоа не се случајни патологии. Тоа се форми во кои стапалото било присилно да живее. Внатрешните мускули на стапалото слабеат бидејќи не ги користеле; сводот опаѓа бидејќи се потпира на чевелот, а не на сопствените мускули.'),
      h('a2-mk-h2', 'Распостелата на прстите е придвижување'),
      p('a2-mk-3', 'Секој прст е лост. Кога одиш или трчаш бос, прстите се шират на чекор и потоа потскокнуваат назад — тоа е природна пружина. Затворени прсти не можат да го направат тоа. Стискаш ги во вреќа и потоа се прашуваш зошто стапалата ти се изморени.'),
      h('a2-mk-h3', 'Тестот со хартија'),
      p('a2-mk-4', 'Извади ја ѓаковата вложна од твоите чевли и стави го стапалото врз неа. Ако прстите ти излегуваат над работ или се сместени до ивицата, чевлот е претесен. Тестот не е субјективен. Тоа е едноставна геометрија.'),
      h('a2-mk-h4', 'Што да бараш во боса патика'),
      p('a2-mk-5', 'Простор низ — палецот и малиот прст не треба да допираат страни. Простор напред — врвовите на прстите оддалечени барем 6–10 мм од крајот. Без стеснување — формата на патиката треба да ја следи формата на твоето стапало, не обратно.'),
    ],
    body_sq: [
      p('a2-sq-1', 'Kur e vendos këmbën në një fletë letre dhe vizaton konturën, sheh diçka të thjeshtë: këmba është më e gjerë në majat e gishtërinjve, jo në bazë. Tani shiko shumicën e këpucëve në dollap — pothuajse të gjitha ngushtohen përpara. Rezultati: gishtërinjtë shtyhen njëri tek tjetri.'),
      h('a2-sq-h1', 'Çfarë ndodh pas dekadave shtrydhjeje'),
      p('a2-sq-2', 'Hallux valgus, gishti i shtrembëruar, "gishti çekiç" — këto nuk janë patologji të rastësishme. Janë forma në të cilat këmba është detyruar të jetojë. Muskujt e brendshëm të këmbës dobësohen sepse nuk i kanë përdorur; harku bie sepse mbështetet te këpuca, jo te muskujt e vetë.'),
      h('a2-sq-h2', 'Hapja e gishtërinjve është lëvizje përpara'),
      p('a2-sq-3', 'Çdo gisht është një levë. Kur ecën ose vrapon zbathur, gishtërinjtë hapen me hapin dhe pastaj kthehen — kjo është një sustë natyrale. Gishtërinjtë e mbyllur nuk mund ta bëjnë këtë. I shtrydh në një qese dhe pastaj pyet pse këmbët janë të lodhura.'),
      h('a2-sq-h3', 'Testi me letër'),
      p('a2-sq-4', 'Hiq taban e brendshëm të këpucës dhe vendos këmbën mbi të. Nëse gishtërinjtë dalin mbi buzë ose janë pranë skajit, këpuca është shumë e ngushtë. Testi nuk është subjektiv. Është gjeometri e thjeshtë.'),
      h('a2-sq-h4', 'Çfarë të kërkosh në një këpucë barefoot'),
      p('a2-sq-5', 'Hapësirë anash — gishti i madh dhe i vogël nuk duhet të prekin anët. Hapësirë përpara — majat e gishtërinjve të paktën 6–10 mm larg fundit. Pa ngushtim — forma e këpucës duhet të ndjekë formën e këmbës, jo e kundërta.'),
    ],
    body_en: [
      p('a2-en-1', 'Place your foot on a sheet of paper and trace it. You will see something simple: the foot is widest at the tips of the toes, not the base. Now look at most shoes in your closet — almost all of them taper toward the front. The result: toes are pushed into each other.'),
      h('a2-en-h1', 'What decades of squeezing actually do'),
      p('a2-en-2', 'Bunions, drifted big toes, hammertoes — these are not random pathologies. They are the shapes your foot was forced to live in. The intrinsic muscles of the foot weaken because they have nothing to do; the arch collapses because it leans on the shoe instead of its own muscles.'),
      h('a2-en-h2', 'Toe splay is propulsion'),
      p('a2-en-3', 'Each toe is a lever. When you walk or run barefoot, the toes splay on the step and spring back — that is a natural propulsion system. Toes bound together cannot do this. Tie them in a bag and then wonder why your feet are tired.'),
      h('a2-en-h3', 'The paper test'),
      p('a2-en-4', 'Pull the insole out of your shoe and place your foot on top of it. If your toes hang over the edge or sit at the rim, the shoe is too narrow. This test isn’t subjective. It is simple geometry.'),
      h('a2-en-h4', 'What to look for in a barefoot toe box'),
      p('a2-en-5', 'Width across — the big and little toe should not touch the sides. Room at the tip — six to ten millimetres clear of the front. No taper — the shoe should follow the shape of your foot, not the other way around.'),
    ],
  },

  // ─── Article 3: Zero drop ──────────────────────────────────────────
  {
    id: 'zero-drop',
    slugs: {
      mk: 'nulta-razlika-shto-menuva',
      sq: 'zero-drop-cfare-ndryshon',
      en: 'zero-drop-what-it-changes',
    },
    title: {
      mk: 'Нулта разлика — што менува',
      sq: 'Zero drop — çfarë ndryshon',
      en: 'Zero drop — what it changes',
    },
    lead: {
      mk: 'Бројот за кој никогаш не си слушнал во спецификација на чевли — оној кој молкум ги обликува твоите колена, колкови и долен дел на грбот.',
      sq: 'Numri për të cilin nuk ke dëgjuar kurrë në një specifikim këpucë — dhe ai që në heshtje formëson gjunjët, ijën dhe pjesën e poshtme të shpinës.',
      en: 'The number you have never heard of in a shoe spec — and the one that quietly shapes your knees, hips, and lower back.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-17T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a3-mk-1', '„Drop“ е разликата во висина помеѓу петицата и предниот дел на чевелот. Повеќето секојдневни чевли имаат 8–12 мм. Многу трчачки чевли — повеќе. Боса патика има нула: твоето стапало лежи рамно, како на земја.'),
      h('a3-mk-h1', 'Зошто бројот воопшто го има'),
      p('a3-mk-2', 'Високите петици помагаат на чевелот да издржи помеко тапканое и да пружи „асистенција“ при чекор. Тоа звучи добро во маркетинг. Во пракса значи: чевелот ја работи задачата што мускулите на твоето стапало и потколеницата би требало да ја работат. Тие потоа слабеат.'),
      h('a3-mk-h2', 'Како подигнатата петица ја менува телото'),
      p('a3-mk-3', 'Подигнатата петица ја навалува целата кинетичка низа напред. За да остане исправено, телото компензира — карлицата се навалува, грбот се извива малку повеќе, коленото зема товар. Тоа е тивка работа, но повторувана со секој чекор, секој ден, со години.'),
      h('a3-mk-h3', 'Нула значи природна состојба'),
      p('a3-mk-4', 'Со нула, твоето стапало лежи рамно. Глуждот, коленото и колкот се поставуваат вертикално. Потколеницата ја работи својата работа — потскокнува наместо да биде „потпрена“ од чевел.'),
      h('a3-mk-h4', 'Што да очекуваш кога ќе се префрлиш'),
      p('a3-mk-5', 'Потколеницата ќе работи повеќе во првите недели. Може да чувствуваш затегнатост во ахилот — ова е растегнување на ткиво кое било скратено со години. Растегни ги тивко, пешачи постепено, и за неколку недели мускулите ќе се прилагодат.'),
    ],
    body_sq: [
      p('a3-sq-1', '"Drop" është dallimi i lartësisë midis thembrës dhe pjesës së përparme të këpucës. Shumica e këpucëve të përditshme kanë 8–12 mm. Shumë këpucë vrapimi — më shumë. Një këpucë barefoot ka zero: këmba shtrihet e sheshtë, si në tokë.'),
      h('a3-sq-h1', 'Pse ky numër ekziston'),
      p('a3-sq-2', 'Thembrat e larta ndihmojnë këpucën të zbusë goditjen dhe të ofrojë "ndihmë" gjatë hapit. Kjo tingëllon mirë në marketing. Në praktikë do të thotë: këpuca po bën punën që muskujt e këmbës dhe kërcirit duhet ta bëjnë. Ata pastaj dobësohen.'),
      h('a3-sq-h2', 'Si e ndryshon trupin një thembër e ngritur'),
      p('a3-sq-3', 'Thembra e ngritur e prirëson të gjithë zinxhirin kinetik përpara. Për të qëndruar drejt, trupi kompenson — legeni anon, shpina kurbohet pak më shumë, gjuri merr ngarkesën. Është një punë e heshtur, por e përsëritur me çdo hap, çdo ditë, për vite.'),
      h('a3-sq-h3', 'Zero do të thotë gjendje natyrale'),
      p('a3-sq-4', 'Me zero, këmba shtrihet e sheshtë. Kavalja, gjuri dhe ija rreshtohen vertikalisht. Kërcinjtë bëjnë punën e tyre — kërcejnë në vend që të jenë "të mbështetur" nga këpuca.'),
      h('a3-sq-h4', 'Çfarë të presësh kur ndërron'),
      p('a3-sq-5', 'Kërcinjtë do të punojnë më shumë në javët e para. Mund të ndjesh shtrëngim në tendinin e Akilit — kjo është një indi që ka qenë i shkurtuar për vite. Shtri ngadalë, ec gradualisht, dhe brenda pak javësh muskujt përshtaten.'),
    ],
    body_en: [
      p('a3-en-1', '"Drop" is the height difference between the heel and the forefoot of a shoe. Most everyday shoes have 8–12 mm. Many running shoes have more. A barefoot shoe has zero: your foot lies flat, as it would on the ground.'),
      h('a3-en-h1', 'Why the number even exists'),
      p('a3-en-2', 'High heels help the shoe absorb impact and "assist" the step. That sounds great in marketing. In practice it means: the shoe is doing the job the muscles of your foot and calf should be doing. They then weaken.'),
      h('a3-en-h2', 'How a raised heel changes the body'),
      p('a3-en-3', 'A raised heel tilts the entire kinetic chain forward. To stay upright, the body compensates — the pelvis tilts, the lower back curves a little more, the knee takes the load. It is quiet work, but repeated with every step, every day, for years.'),
      h('a3-en-h3', 'Zero is the default state'),
      p('a3-en-4', 'With zero, your foot lies flat. Ankle, knee, and hip stack vertically. The calf does its actual job — springing instead of being "propped up" by a shoe.'),
      h('a3-en-h4', 'What to expect when you switch'),
      p('a3-en-5', 'Your calves will work more for the first few weeks. You may feel tightness in the Achilles — this is tissue that has been shortened for years stretching out. Stretch gently, walk gradually, and within a few weeks the muscles adapt.'),
    ],
  },

  // ─── Article 5: Knee and back pain ───────────────────────────────
  {
    id: 'knee-back-pain',
    slugs: {
      mk: 'bolki-vo-koleno-i-grb-barefoot-resenie',
      sq: 'dhimbje-ne-gju-dhe-shpine-kepuce-barefoot',
      en: 'knee-and-back-pain-could-your-shoes-be-the-cause',
    },
    title: {
      mk: 'Болки во колено и грб — може ли чевелот да е причина?',
      sq: 'Dhimbje në gju dhe shpinë — a mund të jetë këpuca shkaku?',
      en: 'Knee and back pain — could your shoes be the cause?',
    },
    lead: {
      mk: 'Ако те болат колената или долниот дел на грбот, решението можеби не е во лекови — туку во начинот на кој стапалото допира земјата.',
      sq: 'Nëse të dhemb gjuri ose pjesa e poshtme e shpinës, zgjidhja mund të mos jetë në ilaçe — por në mënyrën si këmba prek tokën.',
      en: 'If your knees or lower back hurt, the answer may not be in medication — it may be in the way your foot meets the ground.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-22T09:00:00.000Z',
    featured: true,
    body_mk: [
      p('a5-mk-1', 'Болката во колено или во долниот дел на грбот е меѓу најчестите причини поради кои луѓето посетуваат ортопед. Честопати одговорот е лек или физикална терапија — но ретко некој прашува: во какви чевли се движиш цел ден?'),
      h('a5-mk-h1', 'Подигнатата петица и нарушената оска'),
      p('a5-mk-2', 'Обичен чевел со 8–12 мм разлика во висина меѓу петицата и предниот дел ја наклонува целата телесна оска напред. Карлицата се извртува, долниот дел на грбот се принудува во поголема лордоза, а коленото ја апсорбира компензацијата. Ова не е тесна поврзаност — тоа е механика на тело кое секои 1.000 чекори го повторува истиот образец.'),
      h('a5-mk-h2', 'Зошто меките ѓонови не секогаш помагаат'),
      p('a5-mk-3', 'Интуицијата вели: помека обувка = помалку удар = помалку болка. Реалноста е покомплексна. Меките ѓонови ја неутрализираат природната пружина на стапалото — мускулите кои би требало да апсорбираат удар се исклучуваат. Товарот оди директно кон колена и колкови.'),
      h('a5-mk-h3', 'Нулта разлика и коленото'),
      p('a5-mk-4', 'Боси патики со нулта разлика ја враќаат телесната оска во неутрална позиција. Карлицата се исправа, долниот дел на грбот се ослободува, коленото повторно носи само оној товар за кој е конструирано. Истражувањата покажуваат намалување на стресот на коленото при одење во минималистичка обувка наспроти традиционален чевел со потпетица.'),
      h('a5-mk-h4', 'Постепен пристап е клучен'),
      p('a5-mk-5', 'Ако имаш хронична болка, прво консултирај се со физиотерапевт. Ако добиеш зелено светло, почни со боси патики постепено — 1–2 часа дневно на рамна површина. Нема да ги изгубиш болките преку ноќ, но со месеци ќе почувствуваш разлика во тоа колку долго можеш да стоиш и одиш без непријатност.'),
      p('a5-mk-6', 'Босите патики не се лек. Тие се поврат кон биомеханика за која телото е конструирано.'),
    ],
    body_sq: [
      p('a5-sq-1', 'Dhimbja në gju ose në pjesën e poshtme të shpinës është ndër arsyet më të zakonshme pse njerëzit vizitojnë ortopedistin. Shpesh përgjigja është një ilaç ose terapi fizike — por rrallë dikush pyet: çfarë këpucësh po mban gjatë gjithë ditës?'),
      h('a5-sq-h1', 'Thembra e ngritur dhe aksi i prishur'),
      p('a5-sq-2', 'Një këpucë standarde me 8–12 mm dallim lartësie midis thembrave dhe pjesës së përparme e prirëson të gjithë aksën skeletore përpara. Legeni rrotullohet, pjesa e poshtme e shpinës detyrohet në lordozë më të madhe dhe gjuri absorbon kompensimin. Kjo nuk është lidhje e largët — është mekanikë që trupi e përsërit me çdo mijë hapa.'),
      h('a5-sq-h2', 'Pse tabet e buta nuk ndihmojnë gjithmonë'),
      p('a5-sq-3', 'Intuitivisht: këpucë më e butë = goditje më e vogël = dhimbje më e vogël. Realiteti është më kompleks. Tabet e buta neutralizojnë sustën natyrale të këmbës — muskujt që duhet të absorbojnë goditjen çaktivizohen. Ngarkesa shkon direkt tek gjunjët dhe ijet.'),
      h('a5-sq-h3', 'Zero drop dhe gjuri'),
      p('a5-sq-4', 'Këpucët barefoot me zero drop e kthejnë aksën e trupit në pozicion neutral. Legeni drejtohet, pjesa e poshtme e shpinës dekomprimohet, gjuri mbart vetëm ngarkesën për të cilën është projektuar. Studimet tregojnë ulje të stresit të gjurit kur ecet me mbathje minimale krahasuar me një këpucë tradicionale me thembër.'),
      h('a5-sq-h4', 'Qasja graduale është çelësi'),
      p('a5-sq-5', 'Nëse ke dhimbje kronike, konsultohu fillimisht me fizioterapist. Nëse merr miratim, fillo me këpucë barefoot gradualisht — një deri dy orë në ditë në sipërfaqe të rrafshët. Dhimbjet nuk do të zhduken gjatë natës, por pas muajsh do të vëresh sa gjatë mund të qëndrosh dhe ecësh pa shqetësim.'),
      p('a5-sq-6', 'Këpucët barefoot nuk janë ilaç. Ato janë kthim tek biomekanika për të cilën trupi është ndërtuar.'),
    ],
    body_en: [
      p('a5-en-1', 'Knee pain and lower back pain are among the most common reasons people visit an orthopaedic specialist. The answer is often a prescription or physiotherapy — but rarely does anyone ask: what shoes are you wearing all day?'),
      h('a5-en-h1', 'The raised heel and the broken axis'),
      p('a5-en-2', 'A standard shoe with 8–12 mm of heel-to-toe drop tilts the entire skeletal axis forward. The pelvis rotates, the lower back is forced into greater lordosis, and the knee absorbs the compensation. This is not a loose connection — it is mechanics that the body repeats with every thousand steps.'),
      h('a5-en-h2', 'Why soft soles do not always help'),
      p('a5-en-3', 'Intuition says: softer shoe = less impact = less pain. Reality is more complex. Soft soles neutralise the natural spring of the foot — the muscles that should absorb impact are switched off. The load goes directly to the knees and hips.'),
      h('a5-en-h3', 'Zero drop and the knee'),
      p('a5-en-4', 'Barefoot shoes with zero drop return the body axis to a neutral position. The pelvis straightens, the lower back decompresses, the knee carries only the load it was designed for. Research shows reduced knee stress when walking in minimal footwear compared with a traditional heeled shoe.'),
      h('a5-en-h4', 'A gradual approach is the key'),
      p('a5-en-5', 'If you have chronic pain, consult a physiotherapist first. If you get the go-ahead, start with barefoot shoes gradually — one to two hours a day on flat ground. You will not lose the pain overnight, but over months you will notice how much longer you can stand and walk without discomfort.'),
      p('a5-en-6', 'Barefoot shoes are not a cure. They are a return to the biomechanics the body was built for.'),
    ],
  },

  // ─── Article 6: Foot pain / plantar fasciitis ─────────────────────
  {
    id: 'foot-pain-plantar-fasciitis',
    slugs: {
      mk: 'bolki-vo-nozete-plantaren-fasciit',
      sq: 'dhimbje-ne-kembe-fasciiti-plantar',
      en: 'foot-pain-plantar-fasciitis-and-heel-pain',
    },
    title: {
      mk: 'Болки во нозете: плантарен фасциит и пети — зошто се случува и што помага',
      sq: 'Dhimbje në këmbë: fasciiti plantar dhe thembra — pse ndodh dhe çfarë ndihmon',
      en: 'Foot pain: plantar fasciitis and heel pain — why it happens and what helps',
    },
    lead: {
      mk: 'Остра болка во петицата при првиот чекор наутро — можеби е плантарен фасциит. Еве зошто barefoot пристапот помага таму каде перничето не успева.',
      sq: 'Dhimbje e mprehtë në thembër me hapin e parë në mëngjes — ndoshta është fasciit plantar. Ja pse qasja barefoot ndihmon ku jastëku dështon.',
      en: 'Sharp heel pain with your first step in the morning — it may be plantar fasciitis. Here is why the barefoot approach helps where cushioning fails.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-23T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a6-mk-1', 'Остра болка во петицата кога ставаш стапало на под наутро — тоа е класичен знак на плантарен фасциит. Еден од почестите ортопедски проблеми кај возрасните. Добрата вест: разбирањето на причината го прави решението очигледно.'),
      h('a6-mk-h1', 'Што е плантарна фасција'),
      p('a6-mk-2', 'Плантарната фасција е силна лента сврзно ткиво која минува по дното на стапалото — од петицата до прстите. Таа дејствува како пружина при одење и трчање. Кога е преоптоварена или скратена, воспалувањето предизвикува болка — особено силна при prviot чекор по мирување.'),
      h('a6-mk-h2', 'Зошто меки, перничести чевли не секогаш помагаат'),
      p('a6-mk-3', 'Парадоксот: луѓе со плантарен фасциит обично бараат чевли со повеќе перниче. Краткорочно, тоа ублажува. Долгорочно, надворешната поддршка ја задржува фасцијата во скратена позиција — истата скратена позиција која предизвикува болка при станување. Мускулите на стапалото понатаму слабеат.'),
      h('a6-mk-h3', 'Barefoot пристапот — зајакнување наместо потпирање'),
      p('a6-mk-4', 'Истражувањата покажуваат дека флексибилни, тенки ѓонови кои дозволуваат природна работа на стапалото ги зајакнуваат внатрешните мускули на стапалото. Посилно стапало значи помала напнатост на фасцијата — а помалку напнатост значи помалку болка. Транзицијата мора да биде постепена.'),
      h('a6-mk-h4', 'Практични чекори'),
      p('a6-mk-5', 'Прво: поговори со физиотерапевт за да исклучиш покомплексни причини. Второ, ако добиеш зелено светло, почни со 15-минутни прошетки во боса патика со тенок ѓон на рамна површина и додавај 5 минути секоја недела. Трето: растегни ги плантарната фасција и ахилот секое утро пред да станеш од кревет — 30 секунди на секоја страна.'),
      p('a6-mk-6', 'Плантарниот фасциит не е осудба. Со право разбирање и постепено јакнење, поголемиот дел од луѓето забележуваат значајно подобрување за три до шест месеци.'),
    ],
    body_sq: [
      p('a6-sq-1', 'Dhimbje e mprehtë në thembër kur e vë këmbën në dysheme në mëngjes — kjo është shenja klasike e fasciitit plantar. Një nga ankesat ortopedike më të zakonshme tek të rriturit. Lajmi i mirë: të kuptuarit e shkakut e bën zgjidhjen të qartë.'),
      h('a6-sq-h1', 'Çfarë është fascia plantare'),
      p('a6-sq-2', 'Fascia plantare është një shirit i trashë indit lidhës që kalon nëpër fundin e këmbës — nga thembra deri tek gishtërinjtë. Funksionon si një sustë kur ecin dhe vrapojnë. Kur mbingarkohet ose shkurtohet, inflamacioni shkakton dhimbje — sidomos e mprehtë me hapin e parë pas pushimit.'),
      h('a6-sq-h2', 'Pse këpucët me jastëk shpesh nuk ndihmojnë afatgjatë'),
      p('a6-sq-3', 'Paradoksi: njerëzit me fasciit plantar zakonisht zgjedhin këpucë me më shumë jastëk. Afatshkurtër, kjo lehtëson dhimbjen. Afatgjatë, mbështetja e jashtme e mban fascian në pozicion të shkurtuar — i njëjti pozicion që shkakton dhimbje në mëngjes. Muskujt e këmbës vazhdojnë të dobësohen.'),
      h('a6-sq-h3', 'Qasja barefoot — forcim në vend të mbështetjes'),
      p('a6-sq-4', 'Hulumtimet tregojnë se këpucët fleksibël me taban të hollë që lejojnë këmbën të punojë natyrshëm, forcojnë muskujt e brendshëm të këmbës. Një këmbë më e fortë do të thotë më pak tension në fasci — dhe më pak tension do të thotë më pak dhimbje. Por kalimi duhet të jetë gradual.'),
      h('a6-sq-h4', 'Hapat praktikë'),
      p('a6-sq-5', 'Së pari: fol me fizioterapist për të përjashtuar shkaqe më komplekse. Së dyti, nëse merr miratim, fillo me shëtitje pesëmbëdhjetë minutëshe me këpucë barefoot me taban të hollë në sipërfaqe të rrafshët dhe shto pesë minuta çdo javë. Së treti: shtrij fascian plantare dhe tendinit e Akilit çdo mëngjes para se të ngrihesh nga shtrati — tridhjetë sekonda çdo anë.'),
      p('a6-sq-6', 'Fasciiti plantar nuk është një dënim. Me të kuptuarit e duhur dhe forcim gradual, shumica e njerëzve shikojnë përmirësim të rëndësishëm brenda tre deri gjashtë muajve.'),
    ],
    body_en: [
      p('a6-en-1', 'Sharp pain in the heel when you first put your foot on the floor in the morning — that is the classic sign of plantar fasciitis. One of the most common orthopaedic complaints in adults. The good news: understanding the cause makes the solution clear.'),
      h('a6-en-h1', 'What the plantar fascia is'),
      p('a6-en-2', 'The plantar fascia is a thick band of connective tissue running along the bottom of the foot — from the heel to the toes. It acts as a spring when walking and running. When it is overloaded or shortened, inflammation causes pain — especially sharp with the first step after rest.'),
      h('a6-en-h2', 'Why cushioned shoes often do not help long-term'),
      p('a6-en-3', 'The paradox: people with plantar fasciitis typically reach for more cushioning. Short-term, this eases the pain. Long-term, the external support keeps the fascia in a shortened position — the same shortened position that causes morning pain. The foot muscles continue to weaken.'),
      h('a6-en-h3', 'The barefoot approach — strengthening instead of propping'),
      p('a6-en-4', 'Research shows that flexible, thin-soled shoes that allow the foot to work naturally strengthen the intrinsic muscles of the foot. A stronger foot means less tension on the fascia — and less tension means less pain. But the transition must be gradual.'),
      h('a6-en-h4', 'Practical steps'),
      p('a6-en-5', 'First: speak with a physiotherapist to rule out more complex causes. Second, if cleared, begin with fifteen-minute walks in a thin-soled barefoot shoe on flat ground, adding five minutes each week. Third: stretch the plantar fascia and Achilles every morning before getting out of bed — thirty seconds each side.'),
      p('a6-en-6', 'Plantar fasciitis is not a life sentence. With the right understanding and gradual strengthening, most people see significant improvement within three to six months.'),
    ],
  },

  // ─── Article 7: Barefoot guide Macedonia ─────────────────────────
  {
    id: 'barefoot-guide-macedonia',
    slugs: {
      mk: 'barefoot-patiki-makedonija-vodic',
      sq: 'kepuce-barefoot-ne-maqedoni-udhezues',
      en: 'barefoot-shoes-north-macedonia-guide',
    },
    title: {
      mk: 'Barefoot патики во Македонија — комплетен водич',
      sq: 'Këpucë barefoot në Maqedoni — udhëzues i plotë',
      en: 'Barefoot shoes in North Macedonia — a complete guide',
    },
    lead: {
      mk: 'Прв пат слушаш за боси патики? Еве сè што треба да знаеш пред да купиш — и зошто бројот на луѓе во Македонија кои ги носат расте секоја година.',
      sq: 'E dëgjon për herë të parë për këpucët barefoot? Ja gjithçka që duhet të dish para se të blesh — dhe pse numri i njerëzve në Maqedoni që i mbajnë rritet çdo vit.',
      en: 'Hearing about barefoot shoes for the first time? Here is everything you need to know before buying — and why the number of people wearing them in North Macedonia grows every year.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-24T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a7-mk-1', 'Пред неколку години, „barefoot патики" беше израз познат само на фитнес ентузијасти и ортопеди. Денес, сè повеќе луѓе во Македонија ги носат — поради болки, поради свесност за здравјето, или едноставно затоа што нашле нешто поудобно. Ова е краток водич за сè што треба да знаеш.'),
      h('a7-mk-h1', 'Три белези на вистинска боса патика'),
      p('a7-mk-2', 'Не секоја патика со тенок ѓон е barefoot. Вистинска боса патика има три карактеристики: нулта разлика во висина меѓу петицата и предниот дел (zero drop), доволно широка предна страна за природна распостела на прстите, и флексибилен ѓон кој дозволува природно свиткување на стапалото.'),
      h('a7-mk-h2', 'Кои брендови можам да ги најдам во Македонија'),
      p('a7-mk-3', 'Во Босфут можеш да најдеш неколку водечки светски брендови: Xero Shoes (американска компанија, лидер во barefoot сегментот), Freet (британски бренд, одлична конструкција), Be Lenka (словачки бренд, особено популарен за деца), Groundies и Vivobarefoot. Сите брендови се доставуваат до Македонија.'),
      h('a7-mk-h3', 'Како да ја одбереш правата големина'),
      p('a7-mk-4', 'Barefoot патиките се нарачуваат поинаку од обичните. Измери го стапалото стоечки (вечерта, кога е максимално развиено), измери од петицата до врвот на најдолгиот прст, и додади 8–12 мм за природен простор. Секој бренд има сопствена табела на мерки — секогаш провери пред нарачка.'),
      h('a7-mk-h4', 'Дали ми требаат ако немам болки?'),
      p('a7-mk-5', 'Не мора да те боли нешто за да профитираш. Посилни стапала, подобра рамнотежа, природна биомеханика — тоа се добра за секого. Многу луѓе преминуваат едноставно затоа што ги наоѓаат за поудобни по неколку недели адаптација.'),
      p('a7-mk-6', 'Ако си во Македонија и сакаш да пробаш barefoot патики, Босфут е почетна точка — со брендови кои се тестирани и совети за правилна адаптација.'),
    ],
    body_sq: [
      p('a7-sq-1', 'Disa vite më parë, "këpucë barefoot" ishte një term i njohur vetëm nga entuziastët e fitnesit dhe ortopedistët. Sot, gjithnjë e më shumë njerëz në Maqedoni i mbajnë — për shkak të dhimbjeve, ndërgjegjësimit shëndetësor, ose thjesht sepse gjetën diçka më komode. Ky është një udhëzues i shkurtër për gjithçka që duhet të dish.'),
      h('a7-sq-h1', 'Tre shenjat e një këpuce të vërtetë barefoot'),
      p('a7-sq-2', 'Jo çdo këpucë me taban të hollë është barefoot. Një këpucë e vërtetë barefoot ka tre karakteristika: zero drop (pa dallim lartësie midis thembrave dhe pjesës së përparme), maja mjaft e gjerë për hapje natyrale të gishtërinjve, dhe taban fleksibël që lejon këmbën të përkulet natyrshëm.'),
      h('a7-sq-h2', 'Cilat marka janë të disponueshme në Maqedoni'),
      p('a7-sq-3', 'Në Bosfoot mund të gjesh disa marka kryesore botërore: Xero Shoes (kompani amerikane, lider në segmentin barefoot), Freet (markë britanike, ndërtim i shkëlqyer), Be Lenka (markë sllovake, veçanërisht e popullarizuar për fëmijë), Groundies dhe Vivobarefoot. Të gjitha markat dorëzohen në Maqedoni.'),
      h('a7-sq-h3', 'Si të zgjedhësh madhësinë e duhur'),
      p('a7-sq-4', 'Këpucët barefoot maten ndryshe nga këpucët e zakonshme. Mato këmbën duke qëndruar (në mbrëmje, kur këmba është në madhësinë maksimale), mato nga thembra deri në majën e gishtit më të gjatë dhe shto 8–12 mm për hapësirë natyrale. Çdo markë ka tabelën e vet të madhësive — gjithmonë kontrollo para porosisë.'),
      h('a7-sq-h4', 'A i nevojiten nëse nuk kam dhimbje?'),
      p('a7-sq-5', 'Nuk duhet të kesh dhimbje për të përfituar. Këmbë më të forta, ekuilibër më i mirë, biomekanikë natyrale — këto janë të mira për të gjithë. Shumë njerëz kalojnë thjesht sepse i gjejnë më komode pas disa javësh përshtatjeje.'),
      p('a7-sq-6', 'Nëse jeni në Maqedoni dhe dëshironi të provoni këpucë barefoot, Bosfoot është pika fillestare — me marka të testuara dhe udhëzime për përshtatje të duhur.'),
    ],
    body_en: [
      p('a7-en-1', 'A few years ago, "barefoot shoes" was a term known only to fitness enthusiasts and orthopaedists. Today, more and more people in North Macedonia wear them — because of pain, health awareness, or simply because they found something more comfortable. This is a short guide to everything you need to know.'),
      h('a7-en-h1', 'Three marks of a genuine barefoot shoe'),
      p('a7-en-2', 'Not every thin-soled shoe is barefoot. A true barefoot shoe has three characteristics: zero drop (no height difference between heel and forefoot), a wide enough toe box for natural toe splay, and a flexible sole that allows the foot to bend naturally.'),
      h('a7-en-h2', 'Which brands are available in North Macedonia'),
      p('a7-en-3', 'At Bosfoot you can find several leading global brands: Xero Shoes (American company, a leader in the barefoot segment), Freet (British brand, excellent construction), Be Lenka (Slovak brand, especially popular for children), Groundies, and Vivobarefoot. All brands are delivered to North Macedonia.'),
      h('a7-en-h3', 'How to choose the right size'),
      p('a7-en-4', 'Barefoot shoes are sized differently from regular shoes. Measure your foot standing up (in the evening, when the foot is at its largest), measure from heel to the tip of your longest toe, and add 8–12 mm for natural room. Each brand has its own size chart — always check before ordering.'),
      h('a7-en-h4', 'Do I need them if I have no pain?'),
      p('a7-en-5', 'You do not need to be in pain to benefit. Stronger feet, better balance, natural biomechanics — those are good for everyone. Many people switch simply because they find them more comfortable after a few weeks of adaptation.'),
      p('a7-en-6', 'If you are in North Macedonia and want to try barefoot shoes, Bosfoot is the starting point — with tested brands and guidance on proper adaptation.'),
    ],
  },

  // ─── Article 4: Children ──────────────────────────────────────────
  {
    id: 'children-barefoot',
    slugs: {
      mk: 'bosi-patiki-za-deca-stapala-vo-razvoj',
      sq: 'kepuce-barefoot-per-femije',
      en: 'why-children-need-barefoot-shoes',
    },
    title: {
      mk: 'Боси патики за деца — стапала во развој',
      sq: 'Pse fëmijët veçanërisht kanë nevojë për këpucë barefoot',
      en: 'Why children especially need barefoot shoes',
    },
    lead: {
      mk: 'Стапалото на дете е најмногу ’рскавица при раѓање. Чевлите што го држат следните десет години го обликуваат стапалото за цел живот.',
      sq: 'Këmba e një fëmije është kryesisht kërc në lindje. Këpuca që e mban gjatë dhjetë viteve të ardhshme e formon këmbën për gjithë jetën.',
      en: 'A child’s foot is mostly cartilage at birth. The shoe that holds it for the next ten years shapes the foot for life.',
    },
    author: 'Bosfoot',
    publishedAt: '2026-05-18T09:00:00.000Z',
    featured: false,
    body_mk: [
      p('a4-mk-1', 'Стапалото на возрасен има 26 коски. Стапалото на новороденче — главно ’рскавица, која бавно се претвора во коска во текот на следните петнаесет до осумнаесет години. Сето тоа време, формата на чевлот ѕа тивко работи во позадина, како калап.'),
      h('a4-mk-h1', 'Тесните чевли не само што се чувствуваат тесно'),
      p('a4-mk-2', 'Кај возрасни, тесна форма боли. Кај деца, не само што боли — ја презема формата на сè уште меките коски. Бунион кој се појавува кај тинејџер не доаѓа од никаде. Тој расте под секој пар чевли од детството.'),
      h('a4-mk-h2', 'Што покажуваат истражувањата'),
      p('a4-mk-3', 'Деца кои поминуваат повеќе време боси и кои носат флексибилни обувки развиваат посилни сводови, подобра рамнотежа и подобра проприоцепција — способноста да го знаат своето тело во простор. Тоа не е малку. Тоа е основа на сè останато во движењето.'),
      h('a4-mk-h3', 'На што да внимаваш кај детска чевла'),
      p('a4-mk-4', 'Флексибилен ѓон — треба да можеш да го свиткаш на пола со рака. Широка предна страна — палецот и малиот прст не треба да допираат страни. Лесна тежина — детето не треба да го влече чевелот. Без потпетица — рамно стапало е стапало кое може да расте како што треба.'),
      h('a4-mk-h4', 'Боси дома'),
      p('a4-mk-5', 'Најдобрата чевла за развој на стапалото е никаква чевла. Дозволи им на децата да бидат боси во куќа — на дрво, на килим, по плочки. Кога излегуваат надвор, обувај ги во патика која максимално го запазува тоа чувство.'),
    ],
    body_sq: [
      p('a4-sq-1', 'Këmba e një të rrituri ka 26 kocka. Këmba e një foshnje është kryesisht kërc, që ngadalë kthehet në kockë gjatë pesëmbëdhjetë deri tetëmbëdhjetë viteve të ardhshme. Gjatë gjithë kësaj kohe, forma e këpucës punon në heshtje në sfond, si një kallëp.'),
      h('a4-sq-h1', 'Këpucët e ngushta nuk ndihen vetëm të ngushta'),
      p('a4-sq-2', 'Tek të rriturit, një formë e ngushtë dhemb. Tek fëmijët, jo vetëm dhemb — merr formën e kockave ende të buta. Hallux valgus që shfaqet tek një adoleshent nuk vjen nga askund. Rritet nën çdo palë këpucësh të fëmijërisë.'),
      h('a4-sq-h2', 'Çfarë tregojnë studimet'),
      p('a4-sq-3', 'Fëmijët që kalojnë më shumë kohë zbathur dhe që mbajnë këpucë fleksibël zhvillojnë harqe më të forta, ekuilibër më të mirë dhe proprioception më të mirë — aftësinë për të ditur trupin në hapësirë. Kjo nuk është pak. Është themeli i gjithçkaje tjetër në lëvizje.'),
      h('a4-sq-h3', 'Çfarë të kërkosh në një këpucë fëmijësh'),
      p('a4-sq-4', 'Tabani fleksibël — duhet të mund ta përkulësh në mes me një dorë. Maja e gjerë — gishti i madh dhe i vogël nuk duhet të prekin anët. Peshë e lehtë — fëmija nuk duhet ta tërheqë këpucën. Pa thembër — një këmbë e sheshtë është një këmbë që mund të rritet siç duhet.'),
      h('a4-sq-h4', 'Zbathur në shtëpi'),
      p('a4-sq-5', 'Këpuca më e mirë për zhvillimin e këmbës është asnjë këpucë. Lëri fëmijët të jenë zbathur në shtëpi — mbi dru, mbi qilim, mbi pllaka. Kur dalin jashtë, vishi me një këpucë që ruan sa më shumë atë ndjenjë.'),
    ],
    body_en: [
      p('a4-en-1', 'An adult foot has 26 bones. An infant foot is mostly cartilage, slowly turning to bone over the next fifteen to eighteen years. All that time, the shape of the shoe is quietly working in the background, like a mould.'),
      h('a4-en-h1', 'Narrow shoes do not just feel narrow'),
      p('a4-en-2', 'In an adult, a narrow shape hurts. In a child, it doesn’t just hurt — it takes on the shape of still-soft bones. A bunion that appears in a teenager doesn’t come from nowhere. It grows under every pair of childhood shoes.'),
      h('a4-en-h2', 'What the research shows'),
      p('a4-en-3', 'Children who spend more time barefoot and who wear flexible shoes develop stronger arches, better balance, and better proprioception — the ability to know where the body is in space. That is not small. It is the foundation of everything else in movement.'),
      h('a4-en-h3', 'What to look for in a child’s shoe'),
      p('a4-en-4', 'Flexible sole — you should be able to bend it in half with one hand. Wide toe box — the big and little toe should not touch the sides. Light weight — a child shouldn’t have to drag the shoe. No heel — a flat foot is a foot that can grow the way it should.'),
      h('a4-en-h4', 'Barefoot indoors'),
      p('a4-en-5', 'The best shoe for foot development is no shoe. Let children be barefoot at home — on wood, on rug, on tile. When they go outside, dress them in a shoe that preserves as much of that feeling as possible.'),
    ],
  },
]

// ─── Build doc + plan ─────────────────────────────────────────────────
type SanityDoc = Record<string, unknown> & { _id: string; _type: string }

function buildArticleDoc(a: ArticleSeed): SanityDoc {
  return {
    _id: `article--${a.id}`,
    _type: 'article',
    title: { _type: 'localeString', mk: a.title.mk, sq: a.title.sq, en: a.title.en },
    slug: {
      _type: 'localeSlug',
      mk: { _type: 'slug', current: a.slugs.mk },
      sq: { _type: 'slug', current: a.slugs.sq },
      en: { _type: 'slug', current: a.slugs.en },
    },
    lead: { _type: 'localeText', mk: a.lead.mk, sq: a.lead.sq, en: a.lead.en },
    publishedAt: a.publishedAt,
    author: a.author,
    featured: a.featured,
    body_mk: a.body_mk,
    body_sq: a.body_sq,
    body_en: a.body_en,
  }
}

type PlanItem =
  | { kind: 'create'; label: string; doc: SanityDoc }
  | { kind: 'update'; label: string; doc: SanityDoc }
  | { kind: 'unchanged'; label: string }

async function buildPlan(): Promise<PlanItem[]> {
  const ids = articles.map((a) => `article--${a.id}`)
  const existingArr = await client.fetch<SanityDoc[]>(`*[_id in $ids]`, { ids })
  const existing = new Map(existingArr.map((d) => [d._id, d]))

  const plan: PlanItem[] = []
  for (const a of articles) {
    const newDoc = buildArticleDoc(a)
    const label = `${a.title.mk} (${a.slugs.en})`
    const existingDoc = existing.get(newDoc._id)
    if (!existingDoc) {
      plan.push({ kind: 'create', label, doc: newDoc })
    } else if (shallowChanged(existingDoc, newDoc)) {
      plan.push({ kind: 'update', label, doc: newDoc })
    } else {
      plan.push({ kind: 'unchanged', label })
    }
  }
  return plan
}

function shallowChanged(existing: SanityDoc, next: SanityDoc): boolean {
  // Compare relevant fields only — ignore Sanity-internal fields and any
  // fields we don't manage (e.g. coverImage added later via Studio).
  const keys = [
    'title',
    'slug',
    'lead',
    'publishedAt',
    'author',
    'featured',
    'body_mk',
    'body_sq',
    'body_en',
  ]
  for (const k of keys) {
    if (JSON.stringify(existing[k]) !== JSON.stringify(next[k])) return true
  }
  return false
}

// ─── Print ─────────────────────────────────────────────────────────────
function printPlan(plan: PlanItem[]) {
  console.log()
  console.log(
    c.bold +
      'Bosfoot Articles — ' +
      (APPLY ? c.green + 'APPLY' : c.yellow + 'DRY RUN') +
      c.reset,
  )
  console.log(
    c.dim + `Project: ${sanityProjectInfo.projectId} / ${sanityProjectInfo.dataset}` + c.reset,
  )
  console.log()

  for (const item of plan) {
    switch (item.kind) {
      case 'create':
        console.log(`  ${c.green}+ Create:${c.reset} ${item.label}`)
        break
      case 'update':
        console.log(`  ${c.cyan}~ Update:${c.reset} ${item.label}`)
        break
      case 'unchanged':
        console.log(`  ${c.dim}= Unchanged: ${item.label}${c.reset}`)
        break
    }
  }
  console.log()

  const create = plan.filter((p) => p.kind === 'create').length
  const update = plan.filter((p) => p.kind === 'update').length
  const unchanged = plan.filter((p) => p.kind === 'unchanged').length
  console.log(c.bold + 'SUMMARY' + c.reset)
  console.log(`  Create:    ${c.green}${create}${c.reset}`)
  console.log(`  Update:    ${c.cyan}${update}${c.reset}`)
  console.log(`  Unchanged: ${c.dim}${unchanged}${c.reset}`)
  console.log()

  if (!APPLY && (create > 0 || update > 0)) {
    console.log(c.dim + 'To apply these changes:' + c.reset)
    console.log('  pnpm articles:apply')
    console.log()
  }
}

async function applyPlan(plan: PlanItem[]) {
  const writes = plan.filter(
    (p): p is Extract<PlanItem, { kind: 'create' | 'update' }> =>
      p.kind === 'create' || p.kind === 'update',
  )
  if (writes.length === 0) {
    console.log(c.dim + 'Nothing to apply.' + c.reset)
    return
  }

  console.log(c.bold + `Applying ${writes.length} changes...` + c.reset)

  const tx = client.transaction()
  for (const w of writes) {
    // createOrReplace would wipe coverImage if the user already added one in
    // Studio. Use patch+createIfNotExists pattern: createIfNotExists for new
    // docs, patch for existing — preserves any fields we don't manage.
    if (w.kind === 'create') {
      tx.createIfNotExists(w.doc as SanityDoc)
    } else {
      const { _id, _type: _t, ...rest } = w.doc
      void _t
      tx.patch(_id, (patch) => patch.set(rest))
    }
  }

  try {
    await tx.commit()
    console.log(c.green + 'Done.' + c.reset)
  } catch (err) {
    console.error(c.red + 'Transaction failed:' + c.reset, (err as Error).message)
    process.exit(1)
  }
}

// ─── Main ──────────────────────────────────────────────────────────────
async function main() {
  const plan = await buildPlan()
  printPlan(plan)
  if (APPLY) {
    await applyPlan(plan)
  }
}

main().catch((err) => {
  console.error(c.red + 'Fatal:' + c.reset, err)
  process.exit(1)
})
