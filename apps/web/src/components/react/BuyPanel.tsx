import { useState, useMemo } from "react";
import { type Locale, t, pickLocale, formatPrice } from "@/lib/i18n";
import type { ProductDetail, SizeChart } from "@/lib/queries";
import SizeChartModal from "./SizeChartModal";

interface Props {
  product: ProductDetail;
  locale: Locale;
}

/**
 * The right-hand "buy panel" on the product detail page.
 *
 * State:
 *   - selectedColor — chosen color (first available by default)
 *   - selectedSize — chosen EU size (none by default)
 *   - sizeChartOpen — toggles modal
 *
 * Logic:
 *   - Variants are grouped by color first
 *   - Selecting a color filters which sizes are available
 *   - Only in-stock sizes are clickable
 *   - Add-to-cart is disabled until size is chosen
 */
export default function BuyPanel({ product, locale }: Props) {
  // Effective size chart: product override > brand chart > undefined
  const sizeChart: SizeChart | undefined =
    product.sizeChartOverride ?? product.brand.sizeChart;

  // Group variants by color hex
  const colorGroups = useMemo(() => {
    const map = new Map<
      string,
      { hex: string; name: string; variants: typeof product.variants }
    >();
    for (const v of product.variants) {
      const hex = v.colorHex ?? "#cccccc";
      const key = hex;
      const existing = map.get(key);
      if (existing) {
        existing.variants.push(v);
      } else {
        map.set(key, {
          hex,
          name: pickLocale(v.color, locale) ?? "",
          variants: [v],
        });
      }
    }
    return [...map.values()];
  }, [product.variants, locale]);

  const [selectedColorHex, setSelectedColorHex] = useState<string | null>(
    colorGroups[0]?.hex ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  const selectedColor = useMemo(
    () => colorGroups.find((c) => c.hex === selectedColorHex),
    [colorGroups, selectedColorHex],
  );

  // Available sizes for selected color
  const sizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    return [...selectedColor.variants]
      .filter((v) => typeof v.sizeEU === "number")
      .sort((a, b) => a.sizeEU - b.sizeEU);
  }, [selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize) return null;
    return sizesForColor.find((v) => v.sizeEU === selectedSize) ?? null;
  }, [sizesForColor, selectedSize]);

  const onAddToCart = () => {
    if (!selectedVariant) return;
    setAdding(true);
    // For now just simulate — the cart drawer comes in the next session
    // Will dispatch a custom event that the cart store can listen to
    window.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          productId: product._id,
          productSku: product.sku,
          variantSku: selectedVariant.sku,
          variantKey: selectedVariant._key,
          sizeEU: selectedVariant.sizeEU,
          color: pickLocale(selectedVariant.color, locale) ?? "",
          colorHex: selectedVariant.colorHex,
          name: pickLocale(product.name, locale) ?? "",
          brand: product.brand.name,
          price: product.price,
          image: undefined, // wire up later
          quantity: 1,
        },
      }),
    );
    setTimeout(() => setAdding(false), 400);
  };

  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <>
      <div className="space-y-6">
        {/* Brand + name */}
        <div>
          <div className="text-sm uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
            <a
              href={`/${locale}/brands/${product.brand.slug.current}`}
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {product.brand.name}
            </a>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            {pickLocale(product.name, locale)}
          </h1>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-xl font-medium">
            {formatPrice(product.price, locale)}
          </span>
          {onSale && product.compareAtPrice && (
            <span className="text-base text-[var(--color-ink-muted)] line-through">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
          )}
        </div>

        {/* Short description */}
        {pickLocale(product.shortDescription, locale) && (
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {pickLocale(product.shortDescription, locale)}
          </p>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="space-y-1.5">
            {product.highlights.map((h, i) => (
              <li key={h._key ?? i} className="text-sm flex items-start gap-2">
                <span className="text-[var(--color-accent)] flex-shrink-0 mt-0.5">
                  —
                </span>
                <span>{pickLocale(h, locale)}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Color picker */}
        {colorGroups.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium">
                {t("detail.color", locale)}
              </h3>
              <span className="text-sm text-[var(--color-ink-muted)]">
                {selectedColor?.name}
              </span>
            </div>
            <div className="flex gap-2.5">
              {colorGroups.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setSelectedColorHex(c.hex);
                    setSelectedSize(null); // reset size when color changes
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColorHex === c.hex
                      ? "border-[var(--color-ink)] scale-110"
                      : "border-[var(--color-border-default)] hover:border-[var(--color-ink-muted)]"
                  }`}
                  style={{ background: c.hex }}
                  aria-label={c.name}
                  aria-pressed={selectedColorHex === c.hex}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size picker */}
        {sizesForColor.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium">
                {t("detail.size", locale)}
              </h3>
              {sizeChart && (
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline"
                >
                  {t("detail.sizeGuide", locale)} ↗
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {sizesForColor.map((v) => {
                const outOfStock = (v.stock ?? 0) <= 0;
                const isSelected = selectedSize === v.sizeEU;
                return (
                  <button
                    key={v._key}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(v.sizeEU)}
                    className={`relative py-2.5 text-sm border rounded-md transition-colors ${
                      isSelected
                        ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                        : outOfStock
                          ? "bg-[var(--color-bg-tertiary)] border-[var(--color-border-subtle)] text-[var(--color-ink-subtle)] cursor-not-allowed line-through"
                          : "bg-white border-[var(--color-border-default)] hover:border-[var(--color-ink)]"
                    }`}
                  >
                    {v.sizeEU}
                  </button>
                );
              })}
            </div>
            {selectedVariant &&
              selectedVariant.stock > 0 &&
              selectedVariant.stock <= 3 && (
                <p className="mt-2 text-xs text-[var(--color-accent)]">
                  {t("detail.lowStock", locale)} {selectedVariant.stock}{" "}
                  {t("detail.lowStockSuffix", locale)}
                </p>
              )}
          </div>
        )}

        {/* Add to cart */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!selectedVariant || adding}
          className={`w-full py-3.5 text-sm font-medium rounded-md transition-all ${
            !selectedVariant
              ? "bg-[var(--color-bg-tertiary)] text-[var(--color-ink-subtle)] cursor-not-allowed"
              : adding
                ? "bg-[var(--color-success)] text-white"
                : "bg-[var(--color-ink)] text-white hover:bg-black"
          }`}
        >
          {!selectedVariant
            ? t("detail.selectSize", locale)
            : adding
              ? "✓"
              : t("cta.addToCart", locale)}
        </button>

        {/* External brand link */}
        {product.brandProductUrl && (
          <a
            href={product.brandProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors py-2"
          >
            {t("detail.moreFromBrand", locale)} ↗
          </a>
        )}
      </div>

      {/* Size chart modal */}
      {sizeChart && (
        <SizeChartModal
          open={sizeChartOpen}
          onClose={() => setSizeChartOpen(false)}
          sizeChart={sizeChart}
          brandName={product.brand.name}
          brandSizingGuideUrl={product.brand.sizingGuideUrl}
          locale={locale}
        />
      )}
    </>
  );
}
