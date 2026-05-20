import { type Locale, t, pickLocale, localePath } from "@/lib/i18n";
import type { ProductCard as ProductCardData } from "@/lib/queries";
import { productSlug, totalStock } from "@/lib/queries";
import Price from "./Price";

interface Props {
  product: ProductCardData & { mainImageUrl?: string };
  locale: Locale;
}

/**
 * React mirror of `ProductCard.astro` — used inside the React-driven
 * products listing so filtered cards re-render client-side without a
 * roundtrip. Visually identical to the Astro version.
 */
export default function ProductCardReact({ product, locale }: Props) {
  const name = pickLocale(product.name, locale) ?? "Unnamed";
  const slug = productSlug(product, locale);
  const href = localePath(locale, "products", slug);
  const inStock = totalStock(product) > 0;
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  const colorHexes = Array.from(
    new Set(
      product.variants
        .map((v) => v.colorHex)
        .filter((hex): hex is string => Boolean(hex)),
    ),
  );

  return (
    <a
      href={href}
      data-slot="card"
      className="block group flex flex-col bg-card text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
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
          <div className="w-full h-full flex items-center justify-center text-ink-subtle text-xs">
            No image
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.newArrival && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm bg-foreground text-background">
              {t("product.new", locale)}
            </span>
          )}
          {onSale && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm bg-brand text-white">
              {t("product.sale", locale)}
            </span>
          )}
        </div>

        {/* Demo notice — kept top-right so it never collides with NEW/SALE. */}
        <span
          className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-sm bg-amber-100 text-amber-900 ring-1 ring-amber-200/60"
          title="Demo product — image and details are for design preview only"
        >
          Demo
        </span>

        {!inStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">
              {t("product.outOfStock", locale)}
            </span>
          </div>
        )}
      </div>

      {/* Text section */}
      <div className="py-2 flex flex-col gap-2">
        {colorHexes.length > 0 && (
          <div className="flex gap-1.5 items-center min-h-4">
            {colorHexes.slice(0, 6).map((hex) => (
              <span
                key={hex}
                className="w-3.5 h-3.5 rounded-full border border-border"
                style={{ background: hex }}
                aria-hidden
              />
            ))}
            {colorHexes.length > 6 && (
              <span className="text-xs text-muted-foreground">
                +{colorHexes.length - 6}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {product.brand?.name}
          </div>
          <h3 className="text-base font-medium leading-snug text-foreground group-hover:text-brand transition-colors">
            {name}
          </h3>
        </div>

        <div className="flex items-start gap-3 text-sm pt-1">
          <Price
            amount={product.price}
            locale={locale}
            align="start"
            primaryClassName="font-medium text-foreground"
          />
          {onSale && product.compareAtPrice && (
            <Price
              amount={product.compareAtPrice}
              locale={locale}
              align="start"
              className="text-xs"
              primaryClassName="text-muted-foreground line-through"
              secondaryClassName="line-through"
            />
          )}
        </div>
      </div>
    </a>
  );
}
