/**
 * EU ↔ UK ↔ US shoe size conversions.
 *
 * Tables are based on standard ISO conversions. Half sizes are interpolated.
 * Brand-specific deviations (Vivobarefoot runs small, etc.) are handled via
 * each brand's sizingNotes — not adjusted here.
 *
 * Source: International shoe size conversion charts. Values are approximate
 * but standard across the industry.
 */

type Conversion = {
    eu: number
    uk: number
    usMens: number
    usWomens: number
}

const TABLE: Conversion[] = [
    { eu: 35, uk: 2.5, usMens: 3.5, usWomens: 5 },
    { eu: 35.5, uk: 3, usMens: 4, usWomens: 5.5 },
    { eu: 36, uk: 3.5, usMens: 4.5, usWomens: 6 },
    { eu: 36.5, uk: 4, usMens: 5, usWomens: 6.5 },
    { eu: 37, uk: 4, usMens: 5, usWomens: 6.5 },
    { eu: 37.5, uk: 4.5, usMens: 5.5, usWomens: 7 },
    { eu: 38, uk: 5, usMens: 6, usWomens: 7.5 },
    { eu: 38.5, uk: 5.5, usMens: 6.5, usWomens: 8 },
    { eu: 39, uk: 6, usMens: 7, usWomens: 8.5 },
    { eu: 39.5, uk: 6, usMens: 7, usWomens: 8.5 },
    { eu: 40, uk: 6.5, usMens: 7.5, usWomens: 9 },
    { eu: 40.5, uk: 7, usMens: 8, usWomens: 9.5 },
    { eu: 41, uk: 7.5, usMens: 8.5, usWomens: 10 },
    { eu: 41.5, uk: 8, usMens: 9, usWomens: 10.5 },
    { eu: 42, uk: 8, usMens: 9, usWomens: 10.5 },
    { eu: 42.5, uk: 8.5, usMens: 9.5, usWomens: 11 },
    { eu: 43, uk: 9, usMens: 10, usWomens: 11.5 },
    { eu: 43.5, uk: 9.5, usMens: 10.5, usWomens: 12 },
    { eu: 44, uk: 10, usMens: 11, usWomens: 12.5 },
    { eu: 44.5, uk: 10.5, usMens: 11.5, usWomens: 13 },
    { eu: 45, uk: 11, usMens: 12, usWomens: 13.5 },
    { eu: 45.5, uk: 11.5, usMens: 12.5, usWomens: 14 },
    { eu: 46, uk: 12, usMens: 13, usWomens: 14.5 },
    { eu: 46.5, uk: 12.5, usMens: 13.5, usWomens: 15 },
    { eu: 47, uk: 13, usMens: 14, usWomens: 15.5 },
]

/** Find the closest EU-size conversion row */
export function convertSize(eu: number): Conversion {
    // Exact match first
    const exact = TABLE.find((r) => r.eu === eu)
    if (exact) return exact

    // Otherwise find closest
    return TABLE.reduce((closest, current) =>
        Math.abs(current.eu - eu) < Math.abs(closest.eu - eu) ? current : closest,
    )
}

/** Format the conversion as a compact string like "EU 42 · UK 8 · US M 9 / W 10.5" */
export function formatConversion(eu: number): string {
    const c = convertSize(eu)
    return `EU ${c.eu} · UK ${c.uk} · US ${c.usMens}M / ${c.usWomens}W`
}