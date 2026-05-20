import { useState, useMemo, useEffect, useLayoutEffect, useCallback } from "react";
import { type Locale, t } from "@/lib/i18n";
import {
  type FilterState,
  type SortOrder,
  EMPTY_FILTERS,
  applyFilters,
  computeFacets,
  extractFilterOptions,
  filtersToParams,
  paramsToFilters,
} from "@/lib/filters";
import type { ProductCard } from "@/lib/queries";
import ProductCardReact from "./ProductCardReact";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FilterIcon } from "lucide-react";

interface Props {
  products: Array<ProductCard & { mainImageUrl?: string }>;
  locale: Locale;
}

type FilterOptions = ReturnType<typeof extractFilterOptions>;
type Facets = ReturnType<typeof computeFacets>;

interface FilterContentsProps {
  filters: FilterState;
  allOptions: FilterOptions;
  facets: Facets;
  locale: Locale;
  toggleBrand: (slug: string) => void;
  toggleSize: (size: number) => void;
  toggleActivity: (activity: string) => void;
  toggleGender: (gender: string) => void;
  toggleInStock: () => void;
}

/**
 * Filter sections, stacked vertically. Sized for a side drawer column —
 * the size grid is the only nested grid (4 per row).
 */
function FilterContents({
  filters,
  allOptions,
  facets,
  locale,
  toggleBrand,
  toggleSize,
  toggleActivity,
  toggleGender,
  toggleInStock,
}: FilterContentsProps) {
  return (
    <div className="space-y-7">
      {/* Gender */}
      <div>
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-muted-foreground">
          {t("filter.gender", locale)}
        </h3>
        <div className="flex flex-col gap-2">
          {allOptions.genders.map((gender) => {
            const enabled =
              facets.genders.has(gender) ||
              filters.genders.includes(gender);
            const checked = filters.genders.includes(gender);
            return (
              <label
                key={gender}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer",
                  !enabled && "opacity-40 cursor-not-allowed",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!enabled}
                  onChange={() => toggleGender(gender)}
                  className="accent-foreground"
                />
                <span>{t(`gender.${gender}`, locale)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-muted-foreground">
          {t("filter.brand", locale)}
        </h3>
        <div className="flex flex-col gap-2">
          {allOptions.brands.map(({ slug, name }) => {
            const enabled =
              facets.brands.has(slug) || filters.brands.includes(slug);
            const checked = filters.brands.includes(slug);
            return (
              <label
                key={slug}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer",
                  !enabled && "opacity-40 cursor-not-allowed",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!enabled}
                  onChange={() => toggleBrand(slug)}
                  className="accent-foreground"
                />
                <span>{name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Activity */}
      <div>
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-muted-foreground">
          {t("filter.activity", locale)}
        </h3>
        <div className="flex flex-col gap-2">
          {allOptions.activities.map((activity) => {
            const enabled =
              facets.activities.has(activity) ||
              filters.activities.includes(activity);
            const checked = filters.activities.includes(activity);
            return (
              <label
                key={activity}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer",
                  !enabled && "opacity-40 cursor-not-allowed",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!enabled}
                  onChange={() => toggleActivity(activity)}
                  className="accent-foreground"
                />
                <span>{t(`activity.${activity}`, locale)}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-muted-foreground">
          {t("filter.size", locale)}
        </h3>
        <div className="grid grid-cols-4 gap-1.5">
          {allOptions.sizes.map((size) => {
            const enabled =
              facets.sizes.has(size) || filters.sizes.includes(size);
            const checked = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                disabled={!enabled}
                onClick={() => toggleSize(size)}
                className={cn(
                  "px-2 py-2 text-xs rounded-md border transition-colors",
                  checked
                    ? "bg-foreground text-background border-foreground"
                    : enabled
                      ? "bg-background border-border hover:border-foreground"
                      : "bg-accent border-border-subtle text-ink-subtle cursor-not-allowed",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* In-stock toggle */}
      <div>
        <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-muted-foreground">
          {t("filter.inStock", locale).split(" ")[0]}
        </h3>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={toggleInStock}
            className="accent-foreground"
          />
          <span>{t("filter.inStock", locale)}</span>
        </label>
      </div>
    </div>
  );
}

/**
 * Listing page React island.
 *
 * Why React for this: filter clicks need to update the URL, recompute facets,
 * and re-render which products are visible — all without a server roundtrip.
 *
 * Filter UX: shadcn Sheet sliding from the left on all viewports. The same
 * drawer for mobile and desktop keeps the interaction model identical and
 * lets Radix handle focus trap, ESC, body scroll lock, and overlay click.
 */
export default function ProductsListing({ products, locale }: Props) {
  const allOptions = useMemo(() => extractFilterOptions(products), [products]);

  // Initialize from URL on mount
  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window === "undefined") return EMPTY_FILTERS;
    return paramsToFilters(new URLSearchParams(window.location.search));
  });

  const [panelOpen, setPanelOpen] = useState(false);

  // The page's inline script sets data-bf-filter-pending on <html> when the
  // URL has filter params, so the prerendered all-products grid stays hidden
  // until React applies the correct filter. Clear it the moment we mount.
  useLayoutEffect(() => {
    delete document.documentElement.dataset.bfFilterPending;
  }, []);

  // Sync state to URL whenever filters change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = filtersToParams(filters);
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname + (newSearch ? `?${newSearch}` : "");
    window.history.replaceState({}, "", newUrl);
  }, [filters]);

  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  );
  const facets = useMemo(
    () => computeFacets(products, filters),
    [products, filters],
  );

  const toggleBrand = useCallback((slug: string) => {
    setFilters((f) => ({
      ...f,
      brands: f.brands.includes(slug)
        ? f.brands.filter((s) => s !== slug)
        : [...f.brands, slug],
    }));
  }, []);

  const toggleSize = useCallback((size: number) => {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));
  }, []);

  const toggleActivity = useCallback((activity: string) => {
    setFilters((f) => ({
      ...f,
      activities: f.activities.includes(activity as never)
        ? f.activities.filter((a) => a !== activity)
        : ([...f.activities, activity] as typeof f.activities),
    }));
  }, []);

  const toggleGender = useCallback((gender: string) => {
    setFilters((f) => ({
      ...f,
      genders: f.genders.includes(gender as never)
        ? f.genders.filter((g) => g !== gender)
        : ([...f.genders, gender] as typeof f.genders),
    }));
  }, []);

  const setSort = useCallback((sort: SortOrder) => {
    setFilters((f) => ({ ...f, sort }));
  }, []);

  const toggleInStock = useCallback(() => {
    setFilters((f) => ({ ...f, inStock: !f.inStock }));
  }, []);

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const activeFilterCount =
    filters.brands.length +
    filters.sizes.length +
    filters.activities.length +
    filters.genders.length +
    (filters.inStock ? 1 : 0);

  return (
    <div>
      {/* Toolbar — count, filter button, sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-border-subtle">
        <div className="text-sm text-muted-foreground">
          {filtered.length} {t("listing.count", locale)}
          {activeFilterCount > 0 && (
            <span className="ml-2 text-foreground">
              · {activeFilterCount} {t("filter.activeCount", locale)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPanelOpen(true)}
            aria-expanded={panelOpen}
            className="h-10 px-4 text-sm gap-2"
          >
            <FilterIcon className="size-4" aria-hidden />
            <span>{t("filter.title", locale)}</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-medium bg-foreground text-background rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <select
            value={filters.sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="h-10 px-3 text-sm border border-border rounded-md bg-background cursor-pointer hover:bg-secondary"
            aria-label={t("sort.title", locale)}
          >
            <option value="newest">{t("sort.newest", locale)}</option>
            <option value="price-asc">{t("sort.priceAsc", locale)}</option>
            <option value="price-desc">{t("sort.priceDesc", locale)}</option>
          </select>
        </div>
      </div>

      {/* Filter drawer — slides in from the left, used on all viewports */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent
          side="left"
          showCloseButton={true}
          className="data-[side=left]:w-full data-[side=left]:sm:max-w-md p-0 gap-0 flex flex-col"
        >
          <SheetHeader className="px-5 py-4 border-b border-border">
            <SheetTitle className="text-base font-semibold">
              {t("filter.title", locale)}
              {activeFilterCount > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({activeFilterCount})
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Refine the product list by filters
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterContents
              filters={filters}
              allOptions={allOptions}
              facets={facets}
              locale={locale}
              toggleBrand={toggleBrand}
              toggleSize={toggleSize}
              toggleActivity={toggleActivity}
              toggleGender={toggleGender}
              toggleInStock={toggleInStock}
            />
          </div>

          <div
            className="border-t border-border bg-background flex gap-3 px-5 pt-3.5"
            style={{
              paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom))",
            }}
          >
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={clearAll}
                className="flex-1 h-11"
              >
                {t("filter.clear", locale)}
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="flex-1 h-11 hover:bg-primary/90"
            >
              {t("filter.showResults", locale)} {filtered.length}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div
          data-products-grid
          className="py-24 text-center text-muted-foreground"
        >
          <p>{t("listing.empty", locale)}</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-brand underline"
            >
              {t("filter.clear", locale)}
            </button>
          )}
        </div>
      ) : (
        <div
          data-products-grid
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12"
        >
          {filtered.map((p) => (
            <ProductCardReact key={p.sku} product={p} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
