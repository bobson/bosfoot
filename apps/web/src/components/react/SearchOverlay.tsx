import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Locale, t } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Price from "./Price";

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
 * Header search overlay (shadcn Dialog, top-anchored).
 *
 * Listens for a `search:open` custom event (fired by the header button).
 * On first open, fetches `/<lang>/search-index.json` and caches it for the
 * session. Substring match against name and brand; results render with
 * image, name, brand, price. Click navigates; ESC + overlay click + focus
 * trap come from Radix Dialog.
 *
 * Why a single client-side index: catalog is small (tens to a few hundred
 * SKUs). Loads in a single request, every keystroke is instant after that.
 */
export default function SearchOverlay({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("search:open", onOpen);
    return () => window.removeEventListener("search:open", onOpen);
  }, []);

  // Focus input + lazy-load index on first open.
  useEffect(() => {
    if (!open) return;
    // Defer focus past Radix's auto-focus behavior on the dialog root.
    const id = requestAnimationFrame(() => inputRef.current?.focus());

    if (index === null && !loading) {
      setLoading(true);
      fetch(`/${locale}/search-index.json`)
        .then((r) => r.json())
        .then((data: SearchItem[]) => setIndex(data))
        .catch(() => setIndex([]))
        .finally(() => setLoading(false));
    }

    return () => cancelAnimationFrame(id);
  }, [open, locale, index, loading]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  }, []);

  const close = useCallback(() => handleOpenChange(false), [handleOpenChange]);

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          top-[10vh] left-1/2 -translate-x-1/2 translate-y-0
          w-full max-w-xl sm:max-w-xl
          p-0 gap-0 flex flex-col max-h-[80vh] overflow-hidden
          ring-0 shadow-2xl
        "
      >
        <DialogTitle className="sr-only">
          {t("search.title", locale)}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("search.placeholder", locale)}
        </DialogDescription>

        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-border">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
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
            className="flex-1 bg-transparent outline-none text-base text-foreground placeholder:text-ink-subtle"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 -mr-1 text-muted-foreground hover:text-foreground transition-colors"
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
            <p className="px-5 py-6 text-sm text-muted-foreground">
              {t("search.loading", locale)}
            </p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              {t("search.hint", locale)}
            </p>
          )}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              {t("search.empty", locale)}
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-border">
              {results.map((item) => {
                const href = item.slug
                  ? `/${locale}/products/${item.brandSlug}/${item.slug}`
                  : `/${locale}/products`;
                return (
                  <li key={item.sku}>
                    <a
                      href={href}
                      onClick={close}
                      className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-secondary transition-colors"
                    >
                      <div className="w-12 h-12 flex-shrink-0 bg-secondary rounded-md overflow-hidden flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <span className="text-[10px] text-ink-subtle">—</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.brand}
                        </div>
                      </div>
                      <Price
                        amount={item.price}
                        locale={locale}
                        align="end"
                        className="whitespace-nowrap"
                        primaryClassName="text-sm font-medium text-foreground"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
