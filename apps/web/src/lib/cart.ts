/**
 * Bosfoot cart store.
 *
 * Pure TypeScript, no React. Backed by localStorage so the cart persists
 * across page reloads but is scoped to the user's browser.
 *
 * Communicates with the rest of the app via DOM events on `window`:
 *
 *   - `cart:add`     dispatched BY anyone wanting to add an item (e.g. BuyPanel)
 *   - `cart:open`    dispatched BY anyone wanting to open the drawer
 *   - `cart:changed` dispatched BY the store after any mutation. The drawer
 *                    and header count listen for this.
 *
 * Why events instead of React Context or Zustand:
 *   - The cart is consumed by both React islands AND Astro components (header)
 *   - Astro components don't share React state across islands by default
 *   - DOM events work in all contexts: React, vanilla JS, Astro
 *   - ~100 lines of code instead of ~500 with a state library
 */

const STORAGE_KEY = 'bosfoot:cart:v1'

export type CartItem = {
    productId: string // Sanity _id
    productSku: string
    variantSku: string
    variantKey: string // variant's _key in the product
    sizeEU: number
    color: string // localized at time of add
    colorHex?: string
    name: string // localized at time of add
    brand: string
    brandSlug: string
    slug: string // localized at time of add
    price: number // price at time of add, in MKD
    image?: string // pre-resolved URL
    quantity: number
}

export type Cart = {
    items: CartItem[]
    /** When the cart was last updated, ISO string */
    updatedAt: string
}

const EMPTY_CART: Cart = { items: [], updatedAt: new Date(0).toISOString() }

/** A unique key per line — same product+variant in the cart twice would be a duplicate */
function lineKey(productSku: string, variantSku: string): string {
    return `${productSku}::${variantSku}`
}

/* ─────────────────────────────────────────────────────────────────────
   READ / WRITE
   ───────────────────────────────────────────────────────────────────── */

export function readCart(): Cart {
    if (typeof window === 'undefined') return EMPTY_CART
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return EMPTY_CART
        const parsed = JSON.parse(raw) as Cart
        // Sanity-check shape
        if (!Array.isArray(parsed.items)) return EMPTY_CART
        return parsed
    } catch {
        return EMPTY_CART
    }
}

function writeCart(cart: Cart): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
        window.dispatchEvent(new CustomEvent('cart:changed', { detail: cart }))
    } catch {
        // QuotaExceededError or disabled storage — fail silently, in-memory only
    }
}

/* ─────────────────────────────────────────────────────────────────────
   MUTATIONS
   ───────────────────────────────────────────────────────────────────── */

/** Add a line to the cart, or bump quantity if already present */
export function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }): Cart {
    const cart = readCart()
    const key = lineKey(item.productSku, item.variantSku)
    const existing = cart.items.find(
        (i) => lineKey(i.productSku, i.variantSku) === key,
    )

    if (existing) {
        existing.quantity += item.quantity ?? 1
    } else {
        cart.items.push({ ...item, quantity: item.quantity ?? 1 })
    }

    cart.updatedAt = new Date().toISOString()
    writeCart(cart)
    return cart
}

export function updateQuantity(
    productSku: string,
    variantSku: string,
    quantity: number,
): Cart {
    const cart = readCart()
    const item = cart.items.find(
        (i) => lineKey(i.productSku, i.variantSku) === lineKey(productSku, variantSku),
    )
    if (!item) return cart

    if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i !== item)
    } else {
        item.quantity = quantity
    }

    cart.updatedAt = new Date().toISOString()
    writeCart(cart)
    return cart
}

export function removeFromCart(productSku: string, variantSku: string): Cart {
    return updateQuantity(productSku, variantSku, 0)
}

export function clearCart(): Cart {
    const cart: Cart = { items: [], updatedAt: new Date().toISOString() }
    writeCart(cart)
    return cart
}

/* ─────────────────────────────────────────────────────────────────────
   DERIVED VALUES
   ───────────────────────────────────────────────────────────────────── */

export function itemCount(cart: Cart): number {
    return cart.items.reduce((sum, i) => sum + i.quantity, 0)
}

export function subtotal(cart: Cart): number {
    return cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

/* ─────────────────────────────────────────────────────────────────────
   EVENT HELPERS
   These are the public API for triggering things from other code.
   ───────────────────────────────────────────────────────────────────── */

/** Trigger the drawer to open */
export function openCart(): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('cart:open'))
}

/**
 * Listen for cart changes. Returns an unsubscribe function.
 * Used by React components to keep their state in sync.
 */
export function onCartChange(handler: (cart: Cart) => void): () => void {
    if (typeof window === 'undefined') return () => { }
    const listener = (e: Event) => handler((e as CustomEvent<Cart>).detail)
    window.addEventListener('cart:changed', listener)
    return () => window.removeEventListener('cart:changed', listener)
}

/** Listen for "open the drawer" requests */
export function onCartOpen(handler: () => void): () => void {
    if (typeof window === 'undefined') return () => { }
    window.addEventListener('cart:open', handler)
    return () => window.removeEventListener('cart:open', handler)
}

/**
 * Listen for "an item was added" — triggered by BuyPanel.
 * The drawer opens automatically when this fires.
 */
export function onCartAdd(handler: (detail: any) => void): () => void {
    if (typeof window === 'undefined') return () => { }
    const listener = (e: Event) => handler((e as CustomEvent).detail)
    window.addEventListener('cart:add', listener)
    return () => window.removeEventListener('cart:add', listener)
}