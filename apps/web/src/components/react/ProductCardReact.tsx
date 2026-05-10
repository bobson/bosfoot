import {
  type Locale,
  t,
  pickLocale,
  formatPrice,
  localePath,
} from "@/lib/i18n";
import type { ProductCard as ProductCardData } from "@/lib/queries";
import { productSlug, totalStock } from "@/lib/queries";

interface Props {
  product: ProductCardData & { mainImageUrl?: string };
  locale: Locale;
}

export default function ProductCardReact({ product, locale }: Props) {
  const name = pickLocale(product.name, locale) ?? "Unnamed";
  const slug = productSlug(product, locale);
  const href = localePath(locale, "products", slug);
  const inStock = totalStock(product) > 0;
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  // Unique color hexes for the swatch strip
  const colorHexes = Array.from(
    new Set(
      product.variants
        .map((v) => v.colorHex)
        .filter((hex): hex is string => Boolean(hex)),
    ),
  );

  // Available sizes (in stock only) — for the hover overlay
  const availableSizes = Array.from(
    new Set(
      product.variants
        .filter((v) => (v.stock ?? 0) > 0 && typeof v.sizeEU === "number")
        .map((v) => v.sizeEU as number),
    ),
  ).sort((a, b) => a - b);

  return (
    <a
      href={href}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] rounded-md"
    >
      <article className="space-y-3">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-md bg-[var(--color-bg-secondary)] relative">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              width="600"
              height="600"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-subtle)] text-xs">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.newArrival && (
              <span className="px-2 py-0.5 bg-[var(--color-ink)] text-[var(--color-bg-primary)] text-[10px] uppercase tracking-wider rounded-sm">
                {t("product.new", locale)}
              </span>
            )}
            {onSale && (
              <span className="px-2 py-0.5 bg-[var(--color-accent)] text-white text-[10px] uppercase tracking-wider rounded-sm">
                {t("product.sale", locale)}
              </span>
            )}
          </div>

          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-[var(--color-ink)]">
                {t("product.outOfStock", locale)}
              </span>
            </div>
          )}

          {/* Hover-only available sizes — appears when hovering the card on desktop */}
          {inStock && availableSizes.length > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 opacity-0 translate-y-2 pointer-events-none bg-gradient-to-t from-black/85 via-black/65 to-transparent px-4 pt-8 pb-3 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
              aria-hidden="true"
            >
              <div className="text-[10px] uppercase tracking-wider text-white/70 mb-1.5">
                {t("product.sizesAvailable", locale)}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {availableSizes.map((size) => (
                  <span key={size} className="text-xs text-white font-medium">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color swatches */}
        {colorHexes.length > 0 && (
          <div className="flex gap-1.5 items-center min-h-[16px]">
            {colorHexes.slice(0, 6).map((hex) => (
              <span
                key={hex}
                className="w-3.5 h-3.5 rounded-full border border-[var(--color-border-default)]"
                style={{ background: hex }}
                aria-hidden
              />
            ))}
            {colorHexes.length > 6 && (
              <span className="text-xs text-[var(--color-ink-muted)]">
                +{colorHexes.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Brand + name */}
        <div className="space-y-1">
          <div className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
            {product.brand?.name}
          </div>
          <h3 className="text-base font-medium leading-snug group-hover:text-[var(--color-accent)] transition-colors">
            {name}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">
            {formatPrice(product.price, locale)}
          </span>
          {onSale && product.compareAtPrice && (
            <span className="text-[var(--color-ink-muted)] line-through text-xs">
              {formatPrice(product.compareAtPrice, locale)}
            </span>
          )}
        </div>
      </article>
    </a>
  );
}
