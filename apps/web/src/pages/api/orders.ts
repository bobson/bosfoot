/**
 * POST /api/orders
 *
 * Server-side route that receives checkout form data, validates it,
 * creates an order in Sanity, and returns the order ID.
 *
 * IMPORTANT: this file must NEVER be imported from a `client:*` React
 * component. It contains a Sanity write token via the orders module.
 * Astro keeps `pages/api/*` server-only by definition.
 */

import type { APIRoute } from 'astro'
import { createOrder, type CheckoutFormInput } from '@/lib/orders'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
    let body: CheckoutFormInput
    try {
        body = await request.json()
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    // Basic shape validation — server-side defense in depth, even though
    // the client form should catch these too
    const required: Array<keyof CheckoutFormInput> = [
        'email', 'phone', 'firstName', 'lastName', 'address', 'city',
        'postalCode', 'country', 'paymentMethod', 'locale', 'items',
    ]
    const missing = required.filter((k) => !body[k])
    if (missing.length > 0) {
        return new Response(
            JSON.stringify({
                error: 'Missing fields',
                fields: missing,
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    // Light validation
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(body.email)) {
        return new Response(
            JSON.stringify({ error: 'Invalid email' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    if (!['cod', 'bankTransfer'].includes(body.paymentMethod)) {
        return new Response(
            JSON.stringify({ error: 'Invalid payment method' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    try {
        const result = await createOrder(body)
        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)

        // Distinguish validation failure (user can fix) from server error (we have a bug)
        if (message.startsWith('CART_VALIDATION_FAILED:')) {
            const issues = JSON.parse(message.replace('CART_VALIDATION_FAILED:', ''))
            return new Response(
                JSON.stringify({ error: 'Cart validation failed', issues }),
                { status: 409, headers: { 'Content-Type': 'application/json' } },
            )
        }

        console.error('Order creation failed:', err)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
        )
    }
}