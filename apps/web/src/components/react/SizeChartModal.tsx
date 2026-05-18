import { type Locale, t, pickLocale } from "@/lib/i18n";
import { convertSize } from "@/lib/sizes";
import type { SizeChart } from "@/lib/queries";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpRightIcon, MailIcon, XIcon } from "lucide-react";

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
  const measurementLabel =
    sizeChart.measurementType === "insoleLengthMM"
      ? t("brand.sizeChart.measureInsole", locale)
      : t("brand.sizeChart.measureFoot", locale);

  const notes = pickLocale(sizeChart.notes, locale);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="
          w-full max-w-2xl sm:max-w-2xl
          p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden
          ring-0 shadow-xl
        "
      >
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {t("brand.sizeChart", locale)} — {brandName}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon className="size-5" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 space-y-6">
          {notes && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notes}
            </p>
          )}

          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-muted-foreground border-b border-border">
                    EU
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-muted-foreground border-b border-border">
                    UK
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-muted-foreground border-b border-border">
                    US (M)
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-muted-foreground border-b border-border">
                    US (W)
                  </th>
                  <th className="px-4 py-2 font-medium uppercase tracking-wider text-xs text-muted-foreground border-b border-border">
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
                        className="hover:bg-secondary"
                      >
                        <td className="px-4 py-2 border-b border-border-subtle font-medium">
                          {row.sizeEU}
                        </td>
                        <td className="px-4 py-2 border-b border-border-subtle text-muted-foreground">
                          {conv.uk}
                        </td>
                        <td className="px-4 py-2 border-b border-border-subtle text-muted-foreground">
                          {conv.usMens}
                        </td>
                        <td className="px-4 py-2 border-b border-border-subtle text-muted-foreground">
                          {conv.usWomens}
                        </td>
                        <td className="px-4 py-2 border-b border-border-subtle text-muted-foreground">
                          {row.lengthMM} mm
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="font-medium text-foreground">
              {t("sizeChart.howToMeasure", locale)}:
            </strong>{" "}
            {t("sizeChart.measureInstructions", locale)}
          </div>

          {/* Help CTAs */}
          <div className="bg-secondary rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold">
              {t("sizeChart.needHelp", locale)}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("sizeChart.helpDescription", locale)}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={`mailto:${t("sizeChart.helpEmail", locale)}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover"
              >
                <MailIcon className="size-3.5" aria-hidden />
                {t("sizeChart.contactUs", locale)}
              </a>

              {brandSizingGuideUrl && (
                <a
                  href={brandSizingGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-brand"
                >
                  {t("sizeChart.officialGuide", locale)} {brandName}
                  <ArrowUpRightIcon className="size-3" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
