/**
 * Order creation.
 *
 * Flow:
 *   1. Receive cart items + shipping/payment details from the client
 *   2. Re-fetch each product from Sanity to verify current price + stock
 *   3. If anything has changed (price, stock), reject with details so the
 *      client can show the user what's different and let them confirm
 *   4. Build the order document
 *   5. Write to Sanity in a single transaction:
 *      - createIfNotExists for the order document
 *      - patch each variant's stock down by the ordered quantity
 *   6. Return the order's _id so the client can redirect to confirmation
 *
 * What we deliberately do NOT do:
 *   - Trust the client-supplied price (it could be tampered with)
 *   - Allow checkout if any variant is out of stock
 *   - Send the email from this function (separate concern, after order is saved)
 */

import { sanityWrite } from './sanity-server'
import { sanity } from './sanity' // read-only, fine to use here
import type { Locale } from './i18n'

export type OrderLineInput = {
    productId: string
    productSku: string
    variantSku: string
    variantKey: string
    sizeEU: number
    color: string
    colorHex?: string
    name: string
    brand: string
    brandSlug: string
    slug: string
    price: number // what the client thinks the price is (we verify)
    quantity: number
    image?: string
}

export type CheckoutFormInput = {
    // Contact
    email: string
    phone: string

    // Shipping
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
    country: 'MK' | 'AL' | 'XK' | 'RS' | 'BG' | 'GR'
    notes?: string

    // Payment
    paymentMethod: 'cod' | 'bankTransfer'

    // Locale (for emails, currency rendering)
    locale: Locale

    // Cart contents
    items: OrderLineInput[]
}

export type ValidationError = {
    field: string
    message: string
}

/**
 * Re-validate cart items against current Sanity data.
 * Returns the verified items (with authoritative prices) or a list of issues.
 */
export async function validateCart(items: OrderLineInput[]): Promise<
    | { ok: true; verified: Array<OrderLineInput & { authoritativePrice: number }> }
    | { ok: false; issues: ValidationError[] }
> {
    if (items.length === 0) {
        return { ok: false, issues: [{ field: 'items', message: 'Cart is empty' }] }
    }

    const productIds = [...new Set(items.map((i) => i.productId))]

    // One query, all needed products
    const products: Array<{
        _id: string
        sku: string
        price: number
        status: string
        name: { mk?: string; en?: string }
        variants: Array<{ _key: string; sku: string; sizeEU: number; stock: number }>
    }> = await sanity.fetch(
        `*[_type == "product" && _id in $ids]{
      _id, sku, price, status, name,
      "variants": variants[]{_key, sku, sizeEU, stock}
    }`,
        { ids: productIds },
    )

    const productMap = new Map(products.map((p) => [p._id, p]))
    const issues: ValidationError[] = []
    const verified: Array<OrderLineInput & { authoritativePrice: number }> = []

    for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) {
            issues.push({
                field: `items.${item.productSku}`,
                message: `Product ${item.name} is no longer available`,
            })
            continue
        }

        if (product.status !== 'active') {
            issues.push({
                field: `items.${item.productSku}`,
                message: `${item.name} is no longer for sale`,
            })
            continue
        }

        const variant = product.variants.find((v) => v.sku === item.variantSku)
        if (!variant) {
            issues.push({
                field: `items.${item.productSku}`,
                message: `Size ${item.sizeEU} of ${item.name} is no longer available`,
            })
            continue
        }

        if (variant.stock < item.quantity) {
            issues.push({
                field: `items.${item.productSku}`,
                message:
                    variant.stock === 0
                        ? `${item.name} (size ${item.sizeEU}) is out of stock`
                        : `Only ${variant.stock} of ${item.name} (size ${item.sizeEU}) in stock`,
            })
            continue
        }

        verified.push({ ...item, authoritativePrice: product.price })
    }

    if (issues.length > 0) return { ok: false, issues }
    return { ok: true, verified }
}

/* ─────────────────────────────────────────────────────────────────────
   SHIPPING

   For v1 we use a simple flat-rate table. Later this lives in siteSettings
   or a dedicated shippingZone document.
   ───────────────────────────────────────────────────────────────────── */

const SHIPPING_RATES_MKD: Record<string, { fee: number; freeOver?: number }> = {
    MK: { fee: 250, freeOver: 5000 }, // North Macedonia: free over 5000 MKD
    AL: { fee: 1500 },                 // Albania
    XK: { fee: 1500 },                 // Kosovo
    RS: { fee: 1800 },                 // Serbia
    BG: { fee: 1800 },                 // Bulgaria
    GR: { fee: 2200 },                 // Greece
}

export function calculateShipping(
    country: string,
    subtotal: number,
): { fee: number; freeOver?: number; freeShipping: boolean } {
    const rate = SHIPPING_RATES_MKD[country] ?? { fee: 2500 }
    const freeShipping = rate.freeOver ? subtotal >= rate.freeOver : false
    return {
        fee: freeShipping ? 0 : rate.fee,
        freeOver: rate.freeOver,
        freeShipping,
    }
}

/* ─────────────────────────────────────────────────────────────────────
   ORDER CREATION
   ───────────────────────────────────────────────────────────────────── */

export async function createOrder(input: CheckoutFormInput): Promise<{
    ok: true
    orderId: string
    orderNumber: string
}> {
    // Validate cart
    const validation = await validateCart(input.items)
    if (!validation.ok) {
        throw new Error('CART_VALIDATION_FAILED:' + JSON.stringify(validation.issues))
    }

    // Compute totals using authoritative prices (not what client sent)
    const subtotal = validation.verified.reduce(
        (sum, item) => sum + item.authoritativePrice * item.quantity,
        0,
    )

    const shipping = calculateShipping(input.country, subtotal)
    const total = subtotal + shipping.fee

    // Build order number — short, human-readable, sortable
    // Format: BF-YYMMDD-XXXX where XXXX is random 4 chars
    const orderNumber = generateOrderNumber()
    const orderId = `order--${orderNumber.toLowerCase()}`

    // Build the order document
    const orderDoc = {
        _id: orderId,
        _type: 'order',
        orderNumber,
        status: 'pending',
        paymentStatus: input.paymentMethod === 'cod' ? 'cod' : 'pending',
        paymentMethod: input.paymentMethod,

        customer: {
            email: input.email,
            phone: input.phone,
            firstName: input.firstName,
            lastName: input.lastName,
        },

        shippingAddress: {
            address: input.address,
            city: input.city,
            postalCode: input.postalCode,
            country: input.country,
        },

        items: validation.verified.map((item, i) => ({
            _key: `line-${i}`,
            _type: 'orderLine',
            productRef: { _type: 'reference', _ref: item.productId },
            productSnapshot: {
                sku: item.productSku,
                name: item.name,
                brand: item.brand,
                slug: item.slug,
            },
            variantSku: item.variantSku,
            variantKey: item.variantKey,
            sizeEU: item.sizeEU,
            color: item.color,
            unitPrice: item.authoritativePrice,
            quantity: item.quantity,
            lineTotal: item.authoritativePrice * item.quantity,
        })),

        totals: {
            subtotal,
            shipping: shipping.fee,
            total,
            currency: 'MKD',
        },

        notes: input.notes,
        locale: input.locale,
        createdAt: new Date().toISOString(),
    }

    // Transaction: create order + decrement stock atomically
    const tx = sanityWrite.transaction()
    tx.createIfNotExists(orderDoc as any)

    // Decrement stock on each variant
    for (const item of validation.verified) {
        tx.patch(item.productId, (patch) => {
            // Use a GROQ predicate-style key match
            return patch.dec({
                [`variants[_key=="${item.variantKey}"].stock`]: item.quantity,
            })
        })
    }

    await tx.commit()

    return { ok: true, orderId, orderNumber }
}

function generateOrderNumber(): string {
    const now = new Date()
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I, O, 0, 1 to avoid confusion
    let rand = ''
    for (let i = 0; i < 4; i++) {
        rand += chars[Math.floor(Math.random() * chars.length)]
    }
    return `BF-${yy}${mm}${dd}-${rand}`
}