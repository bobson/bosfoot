import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Locale, t, formatPrice } from "@/lib/i18n";

interface Props {
  locale: Locale;
}

type SearchItem = {
  sku: string;
  name: string;
  brand: string;
  brandSlug: string;
  slug?: string;
  price: number;
  gender?: string;
  image: string | null;
};

const MAX_RESULTS = 8;

/**
 * Header search overlay.
 *
 * Listens for a `search:open` custom event (fired by the header button).
 * On first open, fetches `/<lang>/search-index.json` and caches it for
 * the session. Substring match against name and brand; results render
 * with image, name, brand, price. Click navigates; Esc closes.
 *
 * Why a single client-side index: catalog is small (tens to a few hundred
 * SKUs). Loads in a single request, every keystroke is instant after that.
 */
export default function SearchOverlay({ locale }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for open events from the header button.
  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("search:open", onOpen);
    return () => window.removeEventListener("search:open", onOpen);
  }, []);

  // Focus the input + lazy-load the index when first opened.
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    document.documentElement.style.overflow = "hidden";

    if (index === null && !loading) {
      setLoading(true);
      fetch(`/${locale}/search-index.json`)
        .then((r) => r.json())
        .then((data: SearchItem[]) => setIndex(data))
        .catch(() => setIndex([]))
        .finally(() => setLoading(false));
    }

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen, locale, index, loading]);

  // Esc to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const results = useMemo<SearchItem[]>(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const matches: SearchItem[] = [];
    for (const item of index) {
      const haystack = `${item.name} ${item.brand}`.toLowerCase();
      if (haystack.includes(q)) {
        matches.push(item);
        if (matches.length >= MAX_RESULTS) break;
      }
    }
    return matches;
  }, [index, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-16 md:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title", locale)}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="absolute inset-0 bg-black/40 cursor-default"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl mx-4 bg-[var(--color-bg-primary)] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-ink-muted)]"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder", locale)}
            className="flex-1 bg-transparent outline-none text-base placeholder:text-[var(--color-ink-subtle)]"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 -mr-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <svg
              width="18"
              height="18"
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

        {/* Results body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
              {t("search.loading", locale)}
            </p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
              {t("search.hint", locale)}
            </p>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
              {t("search.empty", locale)}
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-[var(--color-border-subtle)]">
              {results.map((item) => {
                const href = item.slug
                  ? `/${locale}/products/${item.slug}`
                  : `/${locale}/products`;
                return (
                  <li key={item.sku}>
                    <a
                      href={href}
                      onClick={close}
                      className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-[var(--color-bg-secondary)] rounded-md overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-[var(--color-ink-subtle)]">
                            —
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--color-ink)] truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)]">
                          {item.brand}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[var(--color-ink)] whitespace-nowrap">
                        {formatPrice(item.price, locale)}
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
