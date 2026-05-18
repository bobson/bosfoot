import { type Locale, formatPriceParts } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  amount: number;
  locale: Locale;
  currency?: string;
  /** Alignment for the stacked EUR line. Defaults to inheriting alignment. */
  align?: "start" | "end";
  /** Class for the wrapper. */
  className?: string;
  /** Class for the primary (MKD) line. */
  primaryClassName?: string;
  /** Class for the secondary (EUR) line. */
  secondaryClassName?: string;
}

/**
 * Renders a price with EUR stacked below MKD on non-MK locales.
 * On `mk` (or non-MKD currency) the secondary line is omitted, so the
 * markup collapses to a single span.
 */
export default function Price({
  amount,
  locale,
  currency = "MKD",
  align,
  className,
  primaryClassName,
  secondaryClassName,
}: Props) {
  const { primary, secondary } = formatPriceParts(amount, locale, currency);

  if (!secondary) {
    return <span className={cn(className, primaryClassName)}>{primary}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex flex-col leading-tight",
        align === "end" && "items-end",
        align === "start" && "items-start",
        className,
      )}
    >
      <span className={primaryClassName}>{primary}</span>
      <span
        className={cn(
          "text-xs font-normal text-muted-foreground",
          secondaryClassName,
        )}
      >
        {secondary}
      </span>
    </span>
  );
}
