/**
 * POST /api/chat
 *
 * Conversational endpoint for the customer-support chat widget. Streams a
 * Claude Haiku 4.5 response back as Server-Sent Events. The catalog of size
 * charts plus the editable FAQ blob is loaded once per cold start (see
 * lib/chat-context) and sent as the system instruction with `cache_control`
 * so repeat conversations only pay ~10% on the prefix.
 *
 * Defences in place:
 *   - Same-origin check: rejects curl/script abuse from other domains
 *   - Per-IP in-memory rate limit: bounds traffic from a single visitor
 *   - Hard caps on `messages.length` and per-message size
 *
 * Server-only. Never imported by a client:* component.
 */

import type { APIRoute } from 'astro'
import Anthropic from '@anthropic-ai/sdk'
import { getChatSystemPrompt } from '@/lib/chat-context'

export const prerender = false

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const MODEL = 'claude-haiku-4-5'
const MAX_MESSAGES = 20
const MAX_CONTENT_CHARS = 1000
const RATE_LIMIT_PER_MIN = 10
const MAX_OUTPUT_TOKENS = 800

// Per-process rate limit. Cold starts on Vercel reset it, which is acceptable
// for v1 — when traffic grows we'll move to Upstash or Vercel KV.
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
    const now = Date.now()
    const windowStart = now - 60_000
    const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart)
    if (recent.length >= RATE_LIMIT_PER_MIN) {
        hits.set(ip, recent)
        return true
    }
    recent.push(now)
    hits.set(ip, recent)
    return false
}

function originOk(request: Request, url: URL): boolean {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')

    let incomingHost: string | null = null
    if (origin) {
        try { incomingHost = new URL(origin).host } catch {}
    } else if (referer) {
        try { incomingHost = new URL(referer).host } catch {}
    }
    if (!incomingHost) return false

    const normalize = (h: string) => h.replace(/^www\./, '').toLowerCase()
    const a = normalize(incomingHost)
    const b = normalize(url.host)

    if (a === b) return true
    // Vercel preview deployments — host looks like bosfoot-git-xxx.vercel.app
    if (a.endsWith('.vercel.app')) return true

    console.warn('chat: origin rejected', { origin, referer, host: url.host })
    return false
}

function jsonError(status: number, error: string): Response {
    return new Response(JSON.stringify({ error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
    if (!originOk(request, url)) {
        return jsonError(403, 'Forbidden')
    }

    const ip = clientAddress ?? 'unknown'
    if (rateLimited(ip)) {
        return jsonError(429, 'Too many requests')
    }

    let body: { messages?: ChatMessage[] }
    try {
        body = await request.json()
    } catch {
        return jsonError(400, 'Invalid JSON body')
    }

    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
        return jsonError(400, 'messages must be a non-empty array')
    }
    if (messages.length > MAX_MESSAGES) {
        return jsonError(400, `messages capped at ${MAX_MESSAGES} per request`)
    }
    for (const m of messages) {
        if (
            !m ||
            (m.role !== 'user' && m.role !== 'assistant') ||
            typeof m.content !== 'string' ||
            m.content.length === 0 ||
            m.content.length > MAX_CONTENT_CHARS
        ) {
            return jsonError(400, 'Invalid message shape')
        }
    }
    if (messages[messages.length - 1].role !== 'user') {
        return jsonError(400, 'Last message must be from the user')
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY
    if (!apiKey) {
        console.error('Missing ANTHROPIC_API_KEY env var')
        return jsonError(500, 'Chat is not configured')
    }

    let systemInstruction: string
    try {
        systemInstruction = await getChatSystemPrompt()
    } catch (err) {
        console.error('Failed to load chat system prompt:', err)
        return jsonError(500, 'Chat is not configured')
    }

    const client = new Anthropic({ apiKey })

    const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
    }))

    // System prompt is sent as a content block with cache_control. The whole
    // prefix (size charts + FAQ) is stable across requests, so cache reads
    // cost ~10% of input price after the first hit. Note: Haiku 4.5 needs a
    // 4096-token minimum prefix to actually cache; smaller FAQs won't trigger
    // it (silent — no error, just no cache hits).
    const stream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.4,
        system: [
            {
                type: 'text',
                text: systemInstruction,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages: apiMessages,
    })

    const encoder = new TextEncoder()
    const sseStream = new ReadableStream({
        async start(controller) {
            try {
                stream.on('text', (delta) => {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`),
                    )
                })

                await stream.finalMessage()
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
            } catch (err) {
                console.error('Anthropic streaming error:', err)
                if (err instanceof Anthropic.RateLimitError) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: 'rate_limited' })}\n\n`,
                        ),
                    )
                } else {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ error: 'stream_failed' })}\n\n`,
                        ),
                    )
                }
                controller.close()
            }
        },
    })

    return new Response(sseStream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
        },
    })
}
