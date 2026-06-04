import { useState, useEffect } from "react";
import { flushSync } from "react-dom";

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

  // Close synchronously before the DOM swap so the overlay/panel are gone
  // from the persisted header before Astro replaces the page content.
  // flushSync ensures React commits the removal before the handler returns.
  useEffect(() => {
    const onBeforeSwap = () => flushSync(() => setOpen(false));
    document.addEventListener("astro:before-swap", onBeforeSwap);
    return () => document.removeEventListener("astro:before-swap", onBeforeSwap);
  }, []);

  // Body scroll lock — plain inline style, no Radix internals to clean up.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
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
      </button>

      {open && (
        <>
          {/* Backdrop — not portaled, lives inside the persisted header */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div
            role="dialog"
            aria-label={siteName}
            aria-modal="true"
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-[min(82%,320px)] bg-popover shadow-lg"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <img src={logoSrc} alt={siteName} className="h-9 w-auto" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

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

            <div className="flex items-center gap-3 px-5 py-4" aria-label="Language">
              {localeLinks.map((opt) => (
                <a
                  key={opt.lang}
                  href={opt.href}
                  hrefLang={opt.lang}
                  aria-current={opt.isActive ? "true" : undefined}
                  onClick={(e) => {
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
          </div>
        </>
      )}
    </>
  );
}
