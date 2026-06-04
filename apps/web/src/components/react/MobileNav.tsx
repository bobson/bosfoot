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

  useEffect(() => {
    const onBeforeSwap = () => {
      flushSync(() => setOpen(false));
      // useEffect cleanup is async — clear scroll lock immediately too.
      document.body.style.overflow = "";
    };
    document.addEventListener("astro:before-swap", onBeforeSwap);
    return () => document.removeEventListener("astro:before-swap", onBeforeSwap);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Hamburger — always mounted inside the persisted header */}
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-12 h-12 -ml-3 text-foreground transition-colors hover:text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </svg>
      </button>

      {/* Backdrop — CSS opacity transition, pointer-events off when closed */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel — CSS translate transition, slides in from the left */}
      <div
        role="dialog"
        aria-label={siteName}
        aria-modal="true"
        inert={!open || undefined}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[min(82%,320px)] bg-popover shadow-xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <img src={logoSrc} alt={siteName} className="h-9 w-auto" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center w-11 h-11 text-muted-foreground hover:text-foreground transition-colors rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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
  );
}
