import { useEffect, useState } from "react";
import { type Locale, t, localePath } from "@/lib/i18n";
import { readCart, onCartChange, openCart, itemCount } from "@/lib/cart";

interface Props {
  locale: Locale;
}

/**
 * Header cart button.
 *
 * - Renders the cart icon + count
 * - Clicking it opens the drawer (via `cart:open` event)
 * - Right-click / middle-click still navigates to the full /cart page
 *   (we use an anchor, not a button, for that reason)
 * - Count updates reactively as items are added/removed
 */
export default function CartCount({ locale }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(itemCount(readCart()));
    return onCartChange((c) => setCount(itemCount(c)));
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // Don't intercept middle-click, ctrl-click, etc. — let them navigate
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    openCart();
  };

  return (
    <a
      href={localePath(locale, "cart")}
      onClick={handleClick}
      className="relative inline-flex items-center justify-center w-10 h-10 -mr-1 text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
      aria-label={t("cart.title", locale)}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span
          className="absolute top-1 right-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center text-[10px] font-medium bg-[var(--color-ink)] text-white rounded-full"
          aria-label={`${count} items`}
        >
          {count}
        </span>
      )}
    </a>
  );
}
