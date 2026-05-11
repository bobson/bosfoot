import { useEffect } from "react";
import { type Locale, t, pickLocale } from "@/lib/i18n";
import { convertSize } from "@/lib/sizes";
import type { SizeChart } from "@/lib/queries";

interface Props {
  open: boolean;
  onClose: () => void;
  sizeChart: SizeChart;
  brandName: string;
  brandSizingGuideUrl?: string;
  locale: Locale;
}

/**
 * Size chart modal.
 *
 * Shows the brand's official size chart + EU/UK/US conversions, the brand's
 * sizing notes, measurement instructions, and TWO calls-to-action:
 *   1. Contact us for sizing advice (encourages real conversation, reduces returns)
 *   2. Read full guide on brand site (if brand has a dedicated sizing page)
 *
 * We deliberately do NOT include a "calculate my size" input — foot-length-based
 * recommendations are misleadingly precise (toe splay, sock thickness, model
 * variation, personal preference all matter). Instead we route uncertain
 * customers to human conversation, which is how barefoot retail actually works.
 */
export default function SizeChartModal({
  open,
  onClose,
  sizeChart,
  brandName,
  brandSizingGuideUrl,
  locale,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const measurementLabel =
    sizeChart.measurementType === "insoleLengthMM"
      ? t("brand.sizeChart.measureInsole", locale)
      : t("brand.sizeChart.measureFoot", locale);

  const notes = pickLocale(sizeChart.notes, locale);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[var(--color-border-subtle)] px-6 py-4 flex items-center justify-between">
          <h2
            id="size-chart-title"
            className="text-lg font-semibold tracking-tight"
          >
            {t("brand.sizeChart", locale)} — {brandName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            aria-label="Close"
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

        <div className="px-6 py-6 space-y-6">
          {notes && (
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {notes}
            </p>
          )}

          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-[var(--color-ink-muted)] border-b border-[var(--color-border-default)]">
                    EU
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-[var(--color-ink-muted)] border-b border-[var(--color-border-default)]">
                    UK
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-[var(--color-ink-muted)] border-b border-[var(--color-border-default)]">
                    US (M)
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-[var(--color-ink-muted)] border-b border-[var(--color-border-default)]">
                    US (W)
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-[var(--color-ink-muted)] border-b border-[var(--color-border-default)]">
                    {measurementLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.rows
                  .slice()
                  .sort((a, b) => a.sizeEU - b.sizeEU)
                  .map((row) => {
                    const conv = convertSize(row.sizeEU);
                    return (
                      <tr
                        key={row.sizeEU}
                        className="hover:bg-[var(--color-bg-secondary)]"
                      >
                        <td className="px-4 py-2 border-b border-[var(--color-border-subtle)] font-medium">
                          {row.sizeEU}
                        </td>
                        <td className="px-4 py-2 border-b border-[var(--color-border-subtle)] text-[var(--color-ink-muted)]">
                          {conv.uk}
                        </td>
                        <td className="px-4 py-2 border-b border-[var(--color-border-subtle)] text-[var(--color-ink-muted)]">
                          {conv.usMens}
                        </td>
                        <td className="px-4 py-2 border-b border-[var(--color-border-subtle)] text-[var(--color-ink-muted)]">
                          {conv.usWomens}
                        </td>
                        <td className="px-4 py-2 border-b border-[var(--color-border-subtle)] text-[var(--color-ink-muted)]">
                          {row.lengthMM} mm
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            <strong className="font-medium text-[var(--color-ink)]">
              {t("sizeChart.howToMeasure", locale)}:
            </strong>{" "}
            {t("sizeChart.measureInstructions", locale)}
          </div>

          {/* Help CTAs */}
          <div className="bg-[var(--color-bg-secondary)] rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold">
              {t("sizeChart.needHelp", locale)}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {t("sizeChart.helpDescription", locale)}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={`mailto:${t("sizeChart.helpEmail", locale)}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {t("sizeChart.contactUs", locale)}
              </a>

              {brandSizingGuideUrl && (
                <a
                  href={brandSizingGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                >
                  {t("sizeChart.officialGuide", locale)} {brandName}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
