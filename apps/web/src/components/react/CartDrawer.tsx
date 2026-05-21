import { useEffect, useState } from "react";
import { type Locale, t, localePath } from "@/lib/i18n";
import Price from "./Price";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Props {
  locale: Locale;
}

/**
 * Right-slide-in cart drawer (shadcn Sheet).
 *
 * Opens automatically when `cart:add` or `cart:open` events fire. Focus trap,
 * ESC, overlay click, and body scroll lock come from Radix Dialog under the
 * hood — no custom plumbing needed.
 *
 * Reads from localStorage on mount, subscribes to `cart:changed` events
 * thereafter to stay in sync with any mutations.
 */
export default function CartDrawer({ locale }: Props) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: "" });
  const [open, setOpen] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);

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

  // After every ClientRouter navigation, reset pending state and force-clear
  // any body scroll lock Radix Dialog might have left behind. Without this the
  // checkout page lands with `body { overflow: hidden }` and is unscrollable
  // on mobile until a focusable element is tapped.
  useEffect(() => {
    const onSwap = () => {
      setCheckoutPending(false);
      setOpen(false);
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("pointer-events");
      document.body.removeAttribute("data-scroll-locked");
    };
    document.addEventListener("astro:after-swap", onSwap);
    return () => document.removeEventListener("astro:after-swap", onSwap);
  }, []);

  const total = subtotal(cart);
  const isEmpty = cart.items.length === 0;
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="data-[side=right]:w-[85%] data-[side=right]:sm:w-full data-[side=right]:sm:max-w-[420px] p-0 gap-0"
      >
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            {t("cart.title", locale)}
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({itemCount})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Shopping cart
          </SheetDescription>
        </SheetHeader>

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
              className="text-ink-subtle mb-4"
              aria-hidden
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="text-sm text-muted-foreground mb-6">
              {t("cart.empty", locale)}
            </p>
            <Button asChild>
              <a
                href={localePath(locale, "products")}
                onClick={() => setOpen(false)}
              >
                {t("cart.emptyCta", locale)}
              </a>
            </Button>
          </div>
        ) : (
          <>
            {/* Line items — scrollable area */}
            <ul className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-border">
              {cart.items.map((item) => (
                <li
                  key={`${item.productSku}-${item.variantSku}`}
                  className="py-4 flex gap-3"
                >
                  <a
                    href={localePath(locale, "products", item.slug)}
                    onClick={() => setOpen(false)}
                    className="block w-20 h-20 shrink-0 rounded-md overflow-hidden bg-secondary"
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

                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground truncate">
                        {item.brand}
                      </div>

                      <a
                        href={localePath(locale, "products", item.slug)}
                        onClick={() => setOpen(false)}
                        className="block text-sm font-medium leading-snug truncate text-foreground hover:text-brand transition-colors mt-0.5"
                      >
                        {item.name}
                      </a>

                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span>
                        {t("cart.size", locale)} {item.sizeEU}
                      </span>
                      {item.color && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1.5">
                            {item.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-border"
                                style={{ background: item.colorHex }}
                                aria-hidden
                              />
                            )}
                            {item.color}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productSku,
                              item.variantSku,
                              item.quantity - 1,
                            )
                          }
                          className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm min-w-5 text-center">
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
                          className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.productSku, item.variantSku)
                        }
                        className="ml-auto inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-destructive transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t("cart.remove", locale)}
                        title={t("cart.remove", locale)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1.5 14a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                    </div>

                    <Price
                      amount={item.price * item.quantity}
                      locale={locale}
                      align="end"
                      className="whitespace-nowrap shrink-0"
                      primaryClassName="text-sm font-medium text-foreground"
                    />
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer — subtotal + checkout button */}
            <div className="border-t border-border px-5 py-4 space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("cart.subtotal", locale)}
                </span>
                <Price
                  amount={total}
                  locale={locale}
                  align="end"
                  primaryClassName="text-base font-semibold text-foreground"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("cart.shippingNote", locale)}
              </p>
              <Button
                asChild
                className="w-full h-9 text-base md:text-sm aria-disabled:opacity-60 aria-disabled:pointer-events-none"
              >
                <a
                  href={localePath(locale, "checkout")}
                  aria-disabled={checkoutPending}
                  onClick={(e) => {
                    if (checkoutPending) {
                      e.preventDefault();
                      return;
                    }
                    setCheckoutPending(true);
                    setOpen(false);
                  }}
                >
                  {checkoutPending && (
                    <span
                      className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2"
                      aria-hidden
                    />
                  )}
                  {t("cart.checkout", locale)}
                </a>
              </Button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
              >
                {t("cart.continueShopping", locale)}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
