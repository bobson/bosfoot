import { useEffect, useState } from "react";
import { type Locale, t, formatPrice, localePath } from "@/lib/i18n";
import {
  type Cart,
  readCart,
  updateQuantity,
  removeFromCart,
  onCartChange,
  onCartOpen,
  onCartAdd,
  subtotal,
} from "@/lib/cart";

interface Props {
  locale: Locale;
}

/**
 * Right-slide-in cart drawer.
 *
 * Opens automatically when:
 *   - a `cart:add` event fires (someone clicked Add to cart)
 *   - a `cart:open` event fires (user clicked the cart icon in header)
 *
 * Closes via:
 *   - clicking the X button
 *   - clicking the backdrop
 *   - pressing Escape
 *   - clicking "Continue shopping"
 *
 * Reads from localStorage on mount, subscribes to `cart:changed` events
 * thereafter to stay in sync with any mutations.
 */
export default function CartDrawer({ locale }: Props) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: "" });
  const [open, setOpen] = useState(false);

  // Load cart on mount + subscribe to mutations
  useEffect(() => {
    setCart(readCart());
    const unsubChange = onCartChange((c) => setCart(c));
    const unsubOpen = onCartOpen(() => setOpen(true));
    const unsubAdd = onCartAdd(() => setOpen(true));
    return () => {
      unsubChange();
      unsubOpen();
      unsubAdd();
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const total = subtotal(cart);
  const isEmpty = cart.items.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title", locale)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("cart.title", locale)}
            {cart.items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[var(--color-ink-muted)]">
                ({cart.items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            aria-label="Close cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-ink-subtle)] mb-4"
              aria-hidden
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6">
              {t("cart.empty", locale)}
            </p>
            <a
              href={localePath(locale, "products")}
              onClick={() => setOpen(false)}
              className="btn btn-primary"
            >
              {t("cart.emptyCta", locale)}
            </a>
          </div>
        ) : (
          <>
            {/* Line items — scrollable area */}
            <ul className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-[var(--color-border-subtle)]">
              {cart.items.map((item) => (
                <li
                  key={`${item.productSku}-${item.variantSku}`}
                  className="py-4 flex gap-3"
                >
                  {/* Thumbnail */}
                  <a
                    href={localePath(locale, "products", item.slug)}
                    onClick={() => setOpen(false)}
                    className="block w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-[var(--color-bg-secondary)]"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </a>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                      {item.brand}
                    </div>
                    <a
                      href={localePath(locale, "products", item.slug)}
                      onClick={() => setOpen(false)}
                      className="block text-sm font-medium leading-snug truncate hover:text-[var(--color-accent)] transition-colors"
                    >
                      {item.name}
                    </a>

                    <div className="text-xs text-[var(--color-ink-muted)] mt-1 flex items-center gap-2">
                      <span>
                        {t("cart.size", locale)} {item.sizeEU}
                      </span>
                      {item.color && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1.5">
                            {item.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-[var(--color-border-default)]"
                                style={{ background: item.colorHex }}
                                aria-hidden
                              />
                            )}
                            {item.color}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Qty controls + price */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-[var(--color-border-default)] rounded-md">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productSku,
                              item.variantSku,
                              item.quantity - 1,
                            )
                          }
                          className="px-2 py-1 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productSku,
                              item.variantSku,
                              item.quantity + 1,
                            )
                          }
                          className="px-2 py-1 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity, locale)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.productSku, item.variantSku)
                      }
                      className="mt-1 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] transition-colors"
                    >
                      {t("cart.remove", locale)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer — subtotal + checkout button */}
            <div className="border-t border-[var(--color-border-subtle)] px-5 py-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  {t("cart.subtotal", locale)}
                </span>
                <span className="text-base font-semibold">
                  {formatPrice(total, locale)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {t("cart.shippingNote", locale)}
              </p>
              <a
                href={localePath(locale, "checkout")}
                className="btn btn-primary w-full"
              >
                {t("cart.checkout", locale)}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] py-2"
              >
                {t("cart.continueShopping", locale)}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
