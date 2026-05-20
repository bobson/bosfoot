import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'bosfoot:chat'
const MAX_HISTORY = 20

/**
 * Floating chat widget — mounted once in BaseLayout, available on every page.
 *
 * Closed state: a small pill in the bottom-right. Open state: a card with a
 * scrollable message list and a textarea. Conversation persists to
 * localStorage so a page navigation doesn't wipe the chat.
 *
 * Streaming: posts to /api/chat and reads SSE chunks back, appending to the
 * last assistant message as text arrives.
 */
export default function ChatWidget() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [draft, setDraft] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)

    // Restore history on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const parsed = JSON.parse(raw) as Message[]
                if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_HISTORY))
            }
        } catch {
            // ignore — corrupt storage shouldn't break the widget
        }
    }, [])

    // Persist on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
        } catch {
            // storage full or disabled — non-fatal
        }
    }, [messages])

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages, open])

    // Focus the textarea when the panel opens
    useEffect(() => {
        if (open) inputRef.current?.focus()
    }, [open])

    const send = useCallback(async () => {
        const text = draft.trim()
        if (!text || sending) return
        if (text.length > 1000) {
            setError('Message is too long (1000 characters max).')
            return
        }

        const next: Message[] = [
            ...messages,
            { role: 'user', content: text },
            { role: 'assistant', content: '' },
        ]
        setMessages(next)
        setDraft('')
        setSending(true)
        setError(null)

        const controller = new AbortController()
        abortRef.current = controller

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: next
                        .slice(0, -1) // drop the empty assistant placeholder
                        .slice(-MAX_HISTORY)
                        .map((m) => ({ role: m.role, content: m.content })),
                }),
                signal: controller.signal,
            })

            if (!res.ok || !res.body) {
                if (res.status === 429) {
                    setError('Too many messages just now — please wait a minute.')
                } else if (res.status === 403) {
                    setError('Chat is unavailable from this page.')
                } else {
                    setError('Something went wrong. Please try again.')
                }
                // remove the placeholder assistant message
                setMessages((prev) => prev.slice(0, -1))
                return
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })

                let idx: number
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const event = buffer.slice(0, idx)
                    buffer = buffer.slice(idx + 2)
                    const line = event.startsWith('data: ') ? event.slice(6) : event
                    if (!line || line === '[DONE]') continue

                    try {
                        const payload = JSON.parse(line) as { text?: string; error?: string }
                        if (payload.error) {
                            setError('The chat ran into a problem mid-reply.')
                            continue
                        }
                        if (payload.text) {
                            setMessages((prev) => {
                                const copy = prev.slice()
                                const last = copy[copy.length - 1]
                                if (last && last.role === 'assistant') {
                                    copy[copy.length - 1] = {
                                        ...last,
                                        content: last.content + payload.text,
                                    }
                                }
                                return copy
                            })
                        }
                    } catch {
                        // ignore unparseable lines
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                setError('Network error. Please try again.')
                setMessages((prev) => prev.slice(0, -1))
            }
        } finally {
            setSending(false)
            abortRef.current = null
        }
    }, [draft, sending, messages])

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
        }
    }

    const clearChat = () => {
        abortRef.current?.abort()
        setMessages([])
        setError(null)
    }

    return (
        <>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Close chat' : 'Open chat'}
                aria-expanded={open}
                className={cn(
                    'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg',
                    'h-12 px-4 text-sm font-medium transition-all hover:scale-105 active:scale-100',
                    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                )}
            >
                <ChatIcon open={open} />
                <span className="hidden sm:inline">{open ? 'Close' : 'Chat'}</span>
            </button>

            {/* Panel */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Customer support chat"
                    className={cn(
                        'fixed bottom-20 right-4 z-50 flex flex-col',
                        'w-[min(22rem,calc(100vw-2rem))] h-[min(32rem,calc(100vh-6rem))]',
                        'rounded-xl border border-border bg-background shadow-2xl',
                        'overflow-hidden',
                    )}
                >
                    <header className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">Bosfoot</span>
                            <span className="text-xs text-muted-foreground">
                                Ask about sizing, shipping, brands…
                            </span>
                        </div>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={clearChat}
                                aria-label="Clear conversation"
                            >
                                Clear
                            </Button>
                        )}
                    </header>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                    >
                        {messages.length === 0 && (
                            <div className="text-sm text-muted-foreground py-4">
                                <p className="mb-2">Hi! I can help with:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>What size am I in a particular brand?</li>
                                    <li>Shipping &amp; returns</li>
                                    <li>About a brand we carry</li>
                                </ul>
                                <p className="mt-3 text-xs">
                                    Tip: for sizing, have your foot length in cm ready.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <MessageBubble key={i} role={m.role} content={m.content} />
                        ))}

                        {sending && messages[messages.length - 1]?.content === '' && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs pl-1">
                                <Dot delay="0ms" />
                                <Dot delay="150ms" />
                                <Dot delay="300ms" />
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-destructive bg-destructive/5 rounded-md px-2 py-1.5">
                                {error}
                            </p>
                        )}
                    </div>

                    <footer className="border-t border-border p-2 flex gap-2 items-end">
                        <textarea
                            ref={inputRef}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Type your question…"
                            rows={1}
                            maxLength={1000}
                            disabled={sending}
                            className={cn(
                                'flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-ring/40',
                                'max-h-24 min-h-9',
                            )}
                        />
                        <Button
                            type="button"
                            onClick={send}
                            disabled={sending || draft.trim().length === 0}
                            size="default"
                        >
                            Send
                        </Button>
                    </footer>
                </div>
            )}
        </>
    )
}

function MessageBubble({ role, content }: Message) {
    const isUser = role === 'user'
    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm',
                )}
            >
                {content || (isUser ? '' : '…')}
            </div>
        </div>
    )
}

function Dot({ delay }: { delay: string }) {
    return (
        <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: delay }}
        />
    )
}

function ChatIcon({ open }: { open: boolean }) {
    // DIY icon — avoids adding a lucide import for two glyphs.
    if (open) {
        return (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        )
    }
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
    )
}
