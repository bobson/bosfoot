import { useState, useEffect, useMemo } from "react";
import { type Locale, t, localePath } from "@/lib/i18n";
import Price from "./Price";
import { readCart, clearCart, subtotal, type Cart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  locale: Locale;
  /** MKD subtotal threshold for free shipping in MK, passed from server */
  freeShippingThresholdMK?: number;
}

type FormState = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: "MK" | "AL" | "XK" | "RS" | "BG" | "GR";
  notes: string;
  paymentMethod: "cod" | "bankTransfer";
};

const EMPTY_FORM: FormState = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "MK",
  notes: "",
  paymentMethod: "cod",
};

/** Computed shipping fees (kept in sync with server's table in lib/orders.ts) */
const SHIPPING_RATES: Record<string, { fee: number; freeOver?: number }> = {
  MK: { fee: 250, freeOver: 5000 },
  AL: { fee: 1500 },
  XK: { fee: 1500 },
  RS: { fee: 1800 },
  BG: { fee: 1800 },
  GR: { fee: 2200 },
};

// Match the look of shadcn <Input> for the native country <select>.
// `bg-background` (not transparent) so the browser's native chevron
// renders against a solid surface in all themes.
const NATIVE_SELECT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function CheckoutForm({ locale }: Props) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: "" });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // Tracks whether the cart has been read from localStorage. Without this,
  // the first paint always renders the empty-cart guard (state starts empty)
  // and flashes before useEffect populates the real items.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCart(readCart());
    setMounted(true);
  }, []);

  const cartSubtotal = useMemo(() => subtotal(cart), [cart]);

  const shippingFee = useMemo(() => {
    const rate = SHIPPING_RATES[form.country] ?? { fee: 2500 };
    if (rate.freeOver && cartSubtotal >= rate.freeOver) return 0;
    return rate.fee;
  }, [form.country, cartSubtotal]);

  const total = cartSubtotal + shippingFee;

  const update =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          locale,
          items: cart.items.map((item) => ({
            productId: item.productId,
            productSku: item.productSku,
            variantSku: item.variantSku,
            variantKey: item.variantKey,
            sizeEU: item.sizeEU,
            color: item.color,
            colorHex: item.colorHex,
            name: item.name,
            brand: item.brand,
            brandSlug: item.brandSlug,
            slug: item.slug,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.issues) {
          setErrors(data.issues.map((i: { message: string }) => i.message));
        } else if (data.fields) {
          setErrors([`Missing required fields: ${data.fields.join(", ")}`]);
        } else {
          setErrors([data.error ?? "Order failed"]);
        }
        setSubmitting(false);
        return;
      }

      // Success — clear cart and redirect
      clearCart();
      window.location.href = `/${locale}/order-confirmed/${data.orderId}`;
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Network error"]);
      setSubmitting(false);
    }
  };

  // Initial paint: cart hasn't been read from localStorage yet. Reserve
  // roughly the same vertical space the form will occupy so the layout
  // doesn't jump when the form renders.
  if (!mounted) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3">
        <div
          role="status"
          aria-label={t("search.loading", locale)}
          className="size-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin"
        />
        <span className="text-sm text-muted-foreground">
          {t("search.loading", locale)}
        </span>
      </div>
    );
  }

  // Empty cart guard
  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground mb-6">{t("cart.empty", locale)}</p>
        <Button asChild>
          <a href={localePath(locale, "products")}>
            {t("cart.emptyCta", locale)}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
    >
      {/* Form columns */}
      <div className="lg:col-span-7 space-y-10">
        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            {t("checkout.contact", locale)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="email" label={t("checkout.email", locale)} required>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                className="h-10"
              />
            </Field>
            <Field id="phone" label={t("checkout.phone", locale)} required>
              <Input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                value={form.phone}
                onChange={update("phone")}
                className="h-10"
              />
            </Field>
          </div>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            {t("checkout.shipping", locale)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              id="firstName"
              label={t("checkout.firstName", locale)}
              required
            >
              <Input
                id="firstName"
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={update("firstName")}
                className="h-10"
              />
            </Field>
            <Field
              id="lastName"
              label={t("checkout.lastName", locale)}
              required
            >
              <Input
                id="lastName"
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={update("lastName")}
                className="h-10"
              />
            </Field>
            <Field
              id="address"
              label={t("checkout.address", locale)}
              required
              full
            >
              <Input
                id="address"
                required
                autoComplete="street-address"
                value={form.address}
                onChange={update("address")}
                className="h-10"
              />
            </Field>
            <Field id="city" label={t("checkout.city", locale)} required>
              <Input
                id="city"
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={update("city")}
                className="h-10"
              />
            </Field>
            <Field
              id="postalCode"
              label={t("checkout.postalCode", locale)}
              required
            >
              <Input
                id="postalCode"
                required
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={update("postalCode")}
                className="h-10"
              />
            </Field>
            <Field
              id="country"
              label={t("checkout.country", locale)}
              required
              full
            >
              <select
                id="country"
                value={form.country}
                onChange={update("country")}
                className={NATIVE_SELECT_CLASS}
              >
                <option value="MK">{t("country.MK", locale)}</option>
                <option value="AL">{t("country.AL", locale)}</option>
                <option value="XK">{t("country.XK", locale)}</option>
                <option value="RS">{t("country.RS", locale)}</option>
                <option value="BG">{t("country.BG", locale)}</option>
                <option value="GR">{t("country.GR", locale)}</option>
              </select>
            </Field>
            <Field id="notes" label={t("checkout.notes", locale)} full>
              <Textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={update("notes")}
                placeholder={t("checkout.notesPlaceholder", locale)}
                className="resize-none"
              />
            </Field>
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            {t("checkout.payment", locale)}
          </h2>
          <div className="space-y-3">
            {(
              [
                {
                  value: "cod" as const,
                  title: t("payment.cod", locale),
                  desc: t("payment.codDescription", locale),
                },
                {
                  value: "bankTransfer" as const,
                  title: t("payment.bankTransfer", locale),
                  desc: t("payment.bankTransferDescription", locale),
                },
              ]
            ).map((option) => {
              const selected = form.paymentMethod === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex gap-3 p-4 border rounded-md cursor-pointer transition-colors",
                    selected
                      ? "border-foreground bg-secondary"
                      : "border-border hover:border-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.value}
                    checked={selected}
                    onChange={() =>
                      setForm((f) => ({ ...f, paymentMethod: option.value }))
                    }
                    className="mt-0.5 accent-foreground"
                  />
                  <div>
                    <div className="text-sm font-medium">{option.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {option.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {/* Summary column */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-24 bg-secondary rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("checkout.summary", locale)}
          </h2>

          {/* Line items */}
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <li
                key={`${item.productSku}-${item.variantSku}`}
                className="flex gap-3 text-sm"
              >
                <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-background">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.brand}
                  </div>
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("cart.size", locale)} {item.sizeEU} · {item.color} · ×
                    {item.quantity}
                  </div>
                </div>
                <Price
                  amount={item.price * item.quantity}
                  locale={locale}
                  align="end"
                  className="whitespace-nowrap"
                  primaryClassName="text-sm font-medium"
                />
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">
                {t("cart.subtotal", locale)}
              </span>
              <Price amount={cartSubtotal} locale={locale} align="end" />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">
                {t("checkout.shippingLabel", locale)}
              </span>
              {shippingFee === 0 ? (
                <span>{t("checkout.freeShipping", locale)}</span>
              ) : (
                <Price amount={shippingFee} locale={locale} align="end" />
              )}
            </div>
            <div className="flex justify-between items-start text-base font-semibold border-t border-border pt-2">
              <span>{t("checkout.total", locale)}</span>
              <Price
                amount={total}
                locale={locale}
                align="end"
                primaryClassName="text-base font-semibold"
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full h-12 hover:bg-primary/90"
          >
            {submitting
              ? t("checkout.placing", locale)
              : t("checkout.placeOrder", locale)}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {t("checkout.terms", locale)}
          </p>
        </div>
      </aside>
    </form>
  );
}

/** Form field with a shadcn <Label>, optional required indicator, optional
 *  full-width column span. Renders children below the label. */
function Field({
  id,
  label,
  required,
  full,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("block space-y-1.5", full && "sm:col-span-2")}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
