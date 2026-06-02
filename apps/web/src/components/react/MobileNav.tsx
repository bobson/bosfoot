import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavLink {
  href: string;
  label: string;
  badge?: boolean;
}

interface LocaleLink {
  lang: string;
  href: string;
  label: string;
  flag: string;
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
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col py-2" aria-label="Mobile primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-5 py-3.5 text-base text-foreground border-b border-border transition-colors hover:bg-secondary hover:text-brand"
            >
              {link.label}
              {link.badge && (
                <span className="bg-brand text-white text-[0.5rem] font-bold uppercase tracking-[0.08em] leading-none px-1.5 py-0.5 rounded-full">
                  New
                </span>
              )}
            </a>
          ))}
        </nav>

        <div
          className="flex items-center gap-3 px-5 py-4"
          aria-label="Language"
        >
          {localeLinks.map((opt) => (
            <a
              key={opt.lang}
              href={opt.href}
              hrefLang={opt.lang}
              aria-current={opt.isActive ? "true" : undefined}
              onClick={(e) => {
                // This island is persisted inside the header, so `opt.href` is
                // frozen to the page where it first rendered. Re-derive the
                // target from the live URL (only the leading locale segment
                // changes — route segments are locale-independent).
                e.preventDefault();
                const rest = window.location.pathname
                  .split("/")
                  .filter(Boolean)
                  .slice(1)
                  .join("/");
                const dest =
                  (rest ? `/${opt.lang}/${rest}` : `/${opt.lang}`) +
                  window.location.search +
                  window.location.hash;
                setOpen(false);
                window.location.assign(dest);
              }}
              className={
                "flex flex-col items-center leading-none px-1.5 py-1 rounded-sm transition-colors " +
                (opt.isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              <span className="emoji-font text-lg leading-none" aria-hidden>
                {opt.flag}
              </span>
              <span
                className={
                  "text-[11px] mt-1 tracking-wide " +
                  (opt.isActive ? "font-semibold" : "font-medium")
                }
              >
                {opt.label}
              </span>
            </a>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
