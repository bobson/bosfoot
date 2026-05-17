import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
}

interface LocaleLink {
  lang: string;
  href: string;
  label: string;
  isActive: boolean;
}

interface Props {
  navLinks: NavLink[];
  localeLinks: LocaleLink[];
  logoSrc: string;
  siteName: string;
}

export default function MobileNav({
  navLinks,
  localeLinks,
  logoSrc,
  siteName,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Menu"
        className="md:hidden inline-flex items-center justify-center w-10 h-10 -ml-2 text-foreground transition-colors hover:text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </SheetTrigger>

      <SheetContent side="left" className="w-[min(82%,320px)] p-0 gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center">
            <img src={logoSrc} alt={siteName} className="h-9 w-auto" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col py-2" aria-label="Mobile primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-5 py-3.5 text-base text-foreground border-b border-border transition-colors hover:bg-secondary hover:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div
          className="flex items-center gap-1 px-5 py-4 text-xs"
          aria-label="Language"
        >
          {localeLinks.map((opt, i) => (
            <span key={opt.lang} className="contents">
              {i > 0 && <span className="text-ink-subtle">·</span>}
              <a
                href={opt.href}
                hrefLang={opt.lang}
                aria-current={opt.isActive ? "true" : undefined}
                className={
                  "px-1.5 py-0.5 transition-colors " +
                  (opt.isActive
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {opt.label}
              </a>
            </span>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
