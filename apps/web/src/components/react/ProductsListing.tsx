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

interface Props {
  products: Array<ProductCard & { mainImageUrl?: string }>;
  locale: Locale;
}

/**
 * Listing page React island.
 *
 * Why React for this: filter clicks need to update the URL, recompute facets,
 * and re-render which products are visible — all without a server roundtrip.
 * That's the kind of state coordination React is best at.
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

  // Lock body scroll while the filter sheet is open on mobile. On desktop the
  // panel renders inline so no lock is needed — but applying it unconditionally
  // is harmless because the inline panel doesn't need scrolling either.
  useEffect(() => {
    if (!panelOpen) return;
    const previous = document.documentElement.style.overflow;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [panelOpen]);

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="text-sm text-[var(--color-ink-muted)]">
          {filtered.length} {t("listing.count", locale)}
          {activeFilterCount > 0 && (
            <span className="ml-2 text-[var(--color-ink)]">
              · {activeFilterCount} {t("filter.activeCount", locale)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPanelOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-[var(--color-border-default)] rounded-md hover:bg-[var(--color-bg-secondary)] transition-colors"
            aria-expanded={panelOpen}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            <span>{t("filter.title", locale)}</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-medium bg-[var(--color-ink)] text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={filters.sort}
            onChange={(e) => setSort(e.target.value as SortOrder)}
            className="px-3 py-2 text-sm border border-[var(--color-border-default)] rounded-md bg-white cursor-pointer hover:bg-[var(--color-bg-secondary)]"
            aria-label={t("sort.title", locale)}
          >
            <option value="newest">{t("sort.newest", locale)}</option>
            <option value="price-asc">{t("sort.priceAsc", locale)}</option>
            <option value="price-desc">{t("sort.priceDesc", locale)}</option>
          </select>
        </div>
      </div>

      {/* Filter panel — inline on desktop, bottom sheet on mobile */}
      {panelOpen && (
        <>
          <div
            className="bf-filter-backdrop"
            onClick={() => setPanelOpen(false)}
            aria-hidden
          />
          <div
            className="bf-filter-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t("filter.title", locale)}
          >
            {/* Mobile-only header */}
            <div className="bf-filter-sheet-header">
              <h2 className="bf-filter-sheet-title">
                {t("filter.title", locale)}
              </h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Close"
                className="bf-filter-sheet-close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <div className="bf-filter-content">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Gender filter */}
            <div>
              <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--color-ink-muted)]">
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
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        enabled ? "" : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!enabled}
                        onChange={() => toggleGender(gender)}
                        className="accent-[var(--color-ink)]"
                      />
                      <span>{t(`gender.${gender}`, locale)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--color-ink-muted)]">
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
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        enabled ? "" : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!enabled}
                        onChange={() => toggleBrand(slug)}
                        className="accent-[var(--color-ink)]"
                      />
                      <span>{name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Activity filter */}
            <div>
              <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--color-ink-muted)]">
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
                      className={`flex items-center gap-2 text-sm cursor-pointer ${
                        enabled ? "" : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!enabled}
                        onChange={() => toggleActivity(activity)}
                        className="accent-[var(--color-ink)]"
                      />
                      <span>{t(`activity.${activity}`, locale)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Size filter */}
            <div>
              <h3 className="text-sm font-medium mb-3 uppercase tracking-wider text-[var(--color-ink-muted)]">
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
                      className={`px-2 py-2 text-xs rounded-md border transition-colors ${
                        checked
                          ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                          : enabled
                            ? "bg-white border-[var(--color-border-default)] hover:border-[var(--color-ink)]"
                            : "bg-[var(--color-bg-tertiary)] border-[var(--color-border-subtle)] text-[var(--color-ink-subtle)] cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* In-stock toggle + clear */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium mb-0 uppercase tracking-wider text-[var(--color-ink-muted)]">
                {t("filter.inStock", locale).split(" ")[0]}
              </h3>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={toggleInStock}
                  className="accent-[var(--color-ink)]"
                />
                <span>{t("filter.inStock", locale)}</span>
              </label>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] underline self-start mt-2"
                >
                  {t("filter.clear", locale)}
                </button>
              )}
            </div>
          </div>
        </div>

            {/* Mobile-only sticky CTA */}
            <div className="bf-filter-sheet-cta">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="bf-filter-sheet-cta-secondary"
                >
                  {t("filter.clear", locale)}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="bf-filter-sheet-cta-primary"
              >
                {t("filter.showResults", locale)} {filtered.length}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div
          data-products-grid
          className="py-24 text-center text-[var(--color-ink-muted)]"
        >
          <p>{t("listing.empty", locale)}</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="mt-4 text-sm text-[var(--color-brand)] underline"
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
