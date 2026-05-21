import { useState, useMemo, useRef, useEffect } from "react";
import { type Locale, t, pickLocale } from "@/lib/i18n";
import type { ProductDetail, SizeChart } from "@/lib/queries";
import { addToCart, openCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Price from "./Price";
import SizeChartModal from "./SizeChartModal";

interface Props {
  product: ProductDetail;
  locale: Locale;
  /** Pre-resolved image URL — Astro frontmatter must compute this and pass it in */
  mainImageUrl?: string;
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
export default function BuyPanel({ product, locale, mainImageUrl }: Props) {
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
  const [showStickyBar, setShowStickyBar] = useState(false);

  const inlineAddBtnRef = useRef<HTMLButtonElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);

  // Show the mobile sticky bar only when the inline Add-to-cart button is out
  // of view. Single IntersectionObserver per page, cleaned up on unmount.
  useEffect(() => {
    const target = inlineAddBtnRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

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

    const productSlug =
      product.slug[locale]?.current ??
      product.slug.mk?.current ??
      product.slug.en?.current ??
      product.sku.toLowerCase();

    addToCart({
      productId: product._id,
      productSku: product.sku,
      variantSku: selectedVariant.sku,
      variantKey: selectedVariant._key,
      sizeEU: selectedVariant.sizeEU,
      color: pickLocale(selectedVariant.color, locale) ?? "",
      colorHex: selectedVariant.colorHex,
      name: pickLocale(product.name, locale) ?? "",
      brand: product.brand.name,
      brandSlug: product.brand.slug.current,
      slug: productSlug,
      price: product.price,
      image: mainImageUrl,
    });

    // Brief confirmation flash, then open the drawer
    setTimeout(() => {
      setAdding(false);
      openCart();
    }, 250);
  };

  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <>
      <div className="space-y-6">
        {/* Brand + name */}
        <div>
          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-1">
            <a
              href={`/${locale}/brands/${product.brand.slug.current}`}
              className="hover:text-brand transition-colors"
            >
              {product.brand.name}
            </a>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            {pickLocale(product.name, locale)}
          </h1>
        </div>

        {/* Price */}
        <div className="flex items-start gap-4">
          <Price
            amount={product.price}
            locale={locale}
            align="start"
            primaryClassName="text-xl font-medium"
          />
          {onSale && product.compareAtPrice && (
            <Price
              amount={product.compareAtPrice}
              locale={locale}
              align="start"
              primaryClassName="text-base text-muted-foreground line-through"
              secondaryClassName="line-through"
            />
          )}
        </div>

        {/* Short description */}
        {pickLocale(product.shortDescription, locale) && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pickLocale(product.shortDescription, locale)}
          </p>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="space-y-1.5">
            {product.highlights.map((h, i) => (
              <li key={h._key ?? i} className="text-sm flex items-start gap-2">
                <span className="text-brand flex-shrink-0 mt-0.5">—</span>
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
              <span className="text-sm text-muted-foreground">
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
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    selectedColorHex === c.hex
                      ? "border-foreground scale-110"
                      : "border-border hover:border-muted-foreground",
                  )}
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
          <div ref={sizePickerRef} className="scroll-mt-24">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-medium">
                {t("detail.size", locale)}
              </h3>
              {sizeChart && (
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="text-xs text-brand hover:text-brand-hover underline"
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
                    className={cn(
                      "relative py-2.5 text-sm border rounded-md transition-colors",
                      isSelected
                        ? "bg-foreground text-background border-foreground"
                        : outOfStock
                          ? "bg-accent border-border-subtle text-ink-subtle cursor-not-allowed line-through"
                          : "bg-background border-border hover:border-foreground",
                    )}
                  >
                    {v.sizeEU}
                  </button>
                );
              })}
            </div>
            {selectedVariant &&
              selectedVariant.stock > 0 &&
              selectedVariant.stock <= 3 && (
                <p className="mt-2 text-xs text-brand">
                  {t("detail.lowStock", locale)} {selectedVariant.stock}{" "}
                  {t("detail.lowStockSuffix", locale)}
                </p>
              )}
          </div>
        )}

        {/* Add to cart */}
        <Button
          ref={inlineAddBtnRef}
          type="button"
          size="lg"
          onClick={onAddToCart}
          disabled={!selectedVariant || adding}
          className={cn(
            "w-full h-12 text-sm font-medium hover:bg-primary/90",
            adding && "bg-success text-white hover:bg-success disabled:opacity-100",
          )}
        >
          {!selectedVariant
            ? t("detail.selectSize", locale)
            : adding
              ? "✓"
              : t("cta.addToCart", locale)}
        </Button>

        {/* External brand link */}
        {product.brandProductUrl && (
          <a
            href={product.brandProductUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-muted-foreground hover:text-brand transition-colors py-2"
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

      {/* Mobile sticky buy bar — appears once the inline Add-to-cart scrolls
          out of view. Hidden on md+ where the desktop sticky BuyPanel column
          keeps the inline button visible anyway. */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-out",
          showStickyBar ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        aria-hidden={!showStickyBar}
      >
        <div className="container-page flex items-center gap-3 py-3">
          <Price
            amount={product.price}
            locale={locale}
            align="start"
            primaryClassName="text-base font-semibold leading-tight"
            secondaryClassName="text-xs leading-tight"
            className="min-w-0 flex-shrink-0"
          />
          <Button
            type="button"
            size="lg"
            onClick={() => {
              if (!selectedVariant) {
                sizePickerRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              } else {
                onAddToCart();
              }
            }}
            disabled={adding}
            className={cn(
              "flex-1 h-12 text-sm font-medium hover:bg-primary/90",
              adding && "bg-success text-white hover:bg-success disabled:opacity-100",
            )}
          >
            {!selectedVariant
              ? t("detail.selectSize", locale)
              : adding
                ? "✓"
                : t("cta.addToCart", locale)}
          </Button>
        </div>
      </div>
    </>
  );
}
