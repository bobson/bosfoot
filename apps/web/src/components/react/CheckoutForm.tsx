import { useState, useEffect, useMemo } from "react";
import { type Locale, t, formatPrice, localePath } from "@/lib/i18n";
import { readCart, clearCart, subtotal, type Cart } from "@/lib/cart";

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

export default function CheckoutForm({ locale }: Props) {
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: "" });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setCart(readCart());
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

  // Empty cart guard
  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--color-ink-muted)] mb-6">
          {t("cart.empty", locale)}
        </p>
        <a href={localePath(locale, "products")} className="btn btn-primary">
          {t("cart.emptyCta", locale)}
        </a>
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
            <Field label={t("checkout.email", locale)} required>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.phone", locale)} required>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={form.phone}
                onChange={update("phone")}
                className="form-input"
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
            <Field label={t("checkout.firstName", locale)} required>
              <input
                required
                autoComplete="given-name"
                value={form.firstName}
                onChange={update("firstName")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.lastName", locale)} required>
              <input
                required
                autoComplete="family-name"
                value={form.lastName}
                onChange={update("lastName")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.address", locale)} required full>
              <input
                required
                autoComplete="street-address"
                value={form.address}
                onChange={update("address")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.city", locale)} required>
              <input
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={update("city")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.postalCode", locale)} required>
              <input
                required
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={update("postalCode")}
                className="form-input"
              />
            </Field>
            <Field label={t("checkout.country", locale)} required full>
              <select
                value={form.country}
                onChange={update("country")}
                className="form-input"
              >
                <option value="MK">{t("country.MK", locale)}</option>
                <option value="AL">{t("country.AL", locale)}</option>
                <option value="XK">{t("country.XK", locale)}</option>
                <option value="RS">{t("country.RS", locale)}</option>
                <option value="BG">{t("country.BG", locale)}</option>
                <option value="GR">{t("country.GR", locale)}</option>
              </select>
            </Field>
            <Field label={t("checkout.notes", locale)} full>
              <textarea
                rows={3}
                value={form.notes}
                onChange={update("notes")}
                className="form-input resize-none"
                placeholder={t("checkout.notesPlaceholder", locale)}
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
            <label className="flex gap-3 p-4 border border-[var(--color-border-default)] rounded-md cursor-pointer hover:border-[var(--color-ink)] transition-colors">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={form.paymentMethod === "cod"}
                onChange={() =>
                  setForm((f) => ({ ...f, paymentMethod: "cod" }))
                }
                className="mt-0.5 accent-[var(--color-ink)]"
              />
              <div>
                <div className="text-sm font-medium">
                  {t("payment.cod", locale)}
                </div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {t("payment.codDescription", locale)}
                </div>
              </div>
            </label>

            <label className="flex gap-3 p-4 border border-[var(--color-border-default)] rounded-md cursor-pointer hover:border-[var(--color-ink)] transition-colors">
              <input
                type="radio"
                name="payment"
                value="bankTransfer"
                checked={form.paymentMethod === "bankTransfer"}
                onChange={() =>
                  setForm((f) => ({ ...f, paymentMethod: "bankTransfer" }))
                }
                className="mt-0.5 accent-[var(--color-ink)]"
              />
              <div>
                <div className="text-sm font-medium">
                  {t("payment.bankTransfer", locale)}
                </div>
                <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {t("payment.bankTransferDescription", locale)}
                </div>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* Summary column */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-24 bg-[var(--color-bg-secondary)] rounded-lg p-6 space-y-4">
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
                <div className="w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-white">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider">
                    {item.brand}
                  </div>
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">
                    {t("cart.size", locale)} {item.sizeEU} · {item.color} · ×
                    {item.quantity}
                  </div>
                </div>
                <div className="text-sm font-medium whitespace-nowrap">
                  {formatPrice(item.price * item.quantity, locale)}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-[var(--color-border-default)] pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">
                {t("cart.subtotal", locale)}
              </span>
              <span>{formatPrice(cartSubtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">
                {t("checkout.shippingLabel", locale)}
              </span>
              <span>
                {shippingFee === 0
                  ? t("checkout.freeShipping", locale)
                  : formatPrice(shippingFee, locale)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-[var(--color-border-default)] pt-2">
              <span>{t("checkout.total", locale)}</span>
              <span>{formatPrice(total, locale)}</span>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-[var(--color-danger)]/10 border border-[var(--color-danger)] rounded-md p-3 text-sm text-[var(--color-danger)]">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting
              ? t("checkout.placing", locale)
              : t("checkout.placeOrder", locale)}
          </button>

          <p className="text-xs text-[var(--color-ink-muted)] text-center leading-relaxed">
            {t("checkout.terms", locale)}
          </p>
        </div>
      </aside>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          background: white;
          transition: border-color 120ms ease;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--color-ink);
        }
      `}</style>
    </form>
  );
}

/** Form field with label, optional `required` indicator, optional full-width */
function Field({
  label,
  required,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
