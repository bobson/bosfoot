/**
 * Builds the system prompt for the Gemini chat agent.
 *
 * Pulls live data from Sanity (per-brand size charts + sizing notes, plus the
 * shop-wide `chatFaq` blob editors maintain in siteSettings → Chat agent).
 * Assembles it into a single string the API route hands to Gemini once per
 * request. Memoized at module scope: first call after cold start does the
 * Sanity fetch, subsequent calls reuse it within the TTL.
 *
 * Server-only — imported by the /api/chat route. Never reach this from a
 * client:* React component.
 */

import { sanity } from './sanity'

type BrandSizing = {
    name: string
    sizeChart?: {
        measurementType: 'footLengthMM' | 'insoleLengthMM'
        rows: Array<{ sizeEU: number; lengthMM: number }>
        notes?: { mk?: string; sq?: string; en?: string }
    }
}

type SiteChatFaq = {
    chatFaq?: { mk?: string; sq?: string; en?: string }
    siteName?: string
}

const BRAND_SIZING_QUERY = `
  *[_type == "brand" && defined(sizeChart)]{
    name,
    sizeChart
  } | order(name asc)
`

const SITE_CHAT_QUERY = `
  *[_id == "siteSettings"][0]{
    siteName,
    chatFaq
  }
`

const TTL_MS = 5 * 60 * 1000 // 5 minutes — Sanity edits propagate within one cache cycle

let cached: { prompt: string; expiresAt: number } | null = null

/** Returns the assembled system prompt. Cached for TTL_MS. */
export async function getChatSystemPrompt(): Promise<string> {
    if (cached && cached.expiresAt > Date.now()) {
        return cached.prompt
    }

    const [brands, site] = await Promise.all([
        sanity.fetch<BrandSizing[]>(BRAND_SIZING_QUERY),
        sanity.fetch<SiteChatFaq>(SITE_CHAT_QUERY),
    ])

    const prompt = buildPrompt(brands ?? [], site ?? {})
    cached = { prompt, expiresAt: Date.now() + TTL_MS }
    return prompt
}

function buildPrompt(brands: BrandSizing[], site: SiteChatFaq): string {
    const siteName = site.siteName ?? 'Bosfoot'

    const faqAll = [site.chatFaq?.en, site.chatFaq?.mk, site.chatFaq?.sq]
        .filter(Boolean)
        .join('\n\n---\n\n')

    const sizeBlock = brands
        .filter((b) => b.sizeChart && b.sizeChart.rows?.length)
        .map(formatBrandSizing)
        .join('\n\n')

    return [
        `You are the customer-support chat agent for ${siteName}, an online shop selling barefoot shoes in the Western Balkans (Macedonia, Albania, Kosovo).`,
        '',
        'STYLE',
        '- Reply in the same language the customer wrote in. Macedonian (Cyrillic), Albanian, and English are all expected; default to Macedonian if the language is unclear.',
        '- Warm, concise, plain language. No marketing fluff. Two short paragraphs at most unless the customer asks for detail.',
        '- Never invent product names, prices, stock, or policies. If you do not know something from the information below, say so and suggest emailing info@bosfoot.com.',
        '',
        'SIZE GUIDANCE',
        '- If the customer asks "what size am I" or similar, do NOT guess. First ask for their foot length in centimetres (measured standing, heel to longest toe, ideally in the evening). Mention they can also send a tracing.',
        '- Once you have a foot length, find the matching brand size chart below. If they have not named a brand, ask which brand or model they are interested in — different brands size differently.',
        '- When a brand chart uses "insoleLengthMM", add roughly 8–10 mm to the customer\'s foot length before mapping, since the insole must be longer than the foot. When a chart uses "footLengthMM", map directly.',
        '- If their foot length lands between two sizes, recommend the larger and mention it.',
        '',
        'WHAT YOU CAN DO',
        '- Answer questions about sizing, brands, materials, shipping, returns, payment, and the shop itself.',
        '- You cannot place orders, change orders, check stock, or look up a specific customer\'s order. Direct those to info@bosfoot.com.',
        '',
        '────────────────────────',
        'SHOP KNOWLEDGE (FAQ)',
        '────────────────────────',
        faqAll || '(No FAQ content has been added yet. If asked about shipping/returns/payment, tell the customer to email info@bosfoot.com.)',
        '',
        '────────────────────────',
        'BRAND SIZE CHARTS',
        '────────────────────────',
        sizeBlock || '(No size charts loaded.)',
    ].join('\n')
}

function formatBrandSizing(b: BrandSizing): string {
    const chart = b.sizeChart!
    const measurementLabel =
        chart.measurementType === 'insoleLengthMM' ? 'insole length' : 'foot length'

    const rows = chart.rows
        .slice()
        .sort((a, z) => a.sizeEU - z.sizeEU)
        .map((r) => `  EU ${r.sizeEU} → ${r.lengthMM} mm`)
        .join('\n')

    const notes = [chart.notes?.en, chart.notes?.mk, chart.notes?.sq]
        .filter(Boolean)
        .map((n) => `  Note: ${n}`)
        .join('\n')

    return [
        `${b.name} (measurement = ${measurementLabel})`,
        rows,
        notes,
    ]
        .filter(Boolean)
        .join('\n')
}
