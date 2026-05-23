import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryImage {
  url: string;
  thumbUrl: string;
  alt?: string;
}

interface Props {
  images: GalleryImage[];
  productName: string;
}

/**
 * Product gallery.
 *   - Desktop: vertical thumbnail strip + large main image.
 *   - Mobile: full-bleed swipeable carousel (CSS scroll-snap, no JS lib)
 *     with a full-bleed thumbnail strip below.
 */
export default function ImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const didMountRef = useRef(false);

  // Track which carousel slide is centered via IntersectionObserver.
  // Cheaper than scroll listeners and matches scroll-snap semantics.
  useEffect(() => {
    const root = carouselRef.current;
    if (!root || images.length <= 1) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = slideRefs.current.findIndex((el) => el === entry.target);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] },
    );

    for (const el of slideRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [images.length]);

  // When the active thumb changes (from a tap or swipe), scroll the thumb
  // strip horizontally so the highlighted thumb stays in view. Skipped on
  // the first mount, otherwise the browser scrolls the whole page to put
  // the thumb in view and pushes the carousel out of the viewport.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const thumb = thumbRefs.current[activeIndex];
    const strip = thumb?.parentElement;
    if (!thumb || !strip) return;
    const target =
      thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({ left: target, behavior: "smooth" });
  }, [activeIndex]);

  const goTo = (i: number) => {
    setActiveIndex(i);
    const slide = slideRefs.current[i];
    const root = carouselRef.current;
    if (slide && root) {
      root.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-secondary rounded-lg flex items-center justify-center text-ink-subtle text-sm">
        No image
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <>
      {/* Mobile: full-bleed swipeable carousel + full-bleed thumb strip */}
      <div className="md:hidden">
        <div
          ref={carouselRef}
          className="-mx-5 flex w-screen snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={productName}
        >
          {images.map((img, i) => (
            <div
              key={i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="aspect-square w-screen flex-shrink-0 snap-center snap-always bg-secondary"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="block h-full w-full cursor-zoom-in"
                aria-label={`Open image ${i + 1} fullscreen`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? productName}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <div
            className="-mx-5 mt-2 flex w-screen gap-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Product images"
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                onClick={() => goTo(i)}
                className={cn(
                  "aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  i === activeIndex
                    ? "border-foreground"
                    : "border-transparent",
                )}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === activeIndex}
              >
                <img
                  src={img.thumbUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: vertical thumbs + main image */}
      <div className="hidden md:flex md:flex-row md:gap-4">
        {images.length > 1 && (
          <div
            className="flex w-20 flex-shrink-0 flex-col gap-3"
            aria-label="Product images"
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  i === activeIndex
                    ? "border-foreground"
                    : "border-transparent hover:border-border-strong",
                )}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === activeIndex}
              >
                <img
                  src={img.thumbUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-lg bg-secondary"
          aria-label="Open image fullscreen"
        >
          <img
            src={active.url}
            alt={active.alt ?? productName}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </button>
      </div>

      <Lightbox
        images={images}
        productName={productName}
        startIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}

/* ─── Fullscreen lightbox ──────────────────────────────────────────── */

interface LightboxProps {
  images: GalleryImage[];
  productName: string;
  startIndex: number | null;
  onClose: () => void;
}

function Lightbox({ images, productName, startIndex, onClose }: LightboxProps) {
  const open = startIndex !== null;
  const [index, setIndex] = useState(startIndex ?? 0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // When opening, jump to the requested slide without animation.
  useEffect(() => {
    if (startIndex === null) return;
    setIndex(startIndex);
    // Defer until the portal has mounted and laid out.
    requestAnimationFrame(() => {
      const slide = slideRefs.current[startIndex];
      const track = trackRef.current;
      if (slide && track) {
        track.scrollTo({ left: slide.offsetLeft, behavior: "instant" });
      }
    });
  }, [startIndex]);

  // Sync index from native swipe via IntersectionObserver.
  useEffect(() => {
    if (!open) return;
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const i = slideRefs.current.findIndex((el) => el === entry.target);
            if (i >= 0) setIndex(i);
          }
        }
      },
      { root: track, threshold: [0.6] },
    );
    for (const el of slideRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [open]);

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(images.length - 1, i));
    const slide = slideRefs.current[next];
    const track = trackRef.current;
    if (slide && track) {
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
    setIndex(next);
  };

  // Keyboard navigation while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // index intentionally captured each effect run so arrows stay in sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 duration-150 data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            {productName}
          </DialogPrimitive.Title>

          <div
            ref={trackRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div
                key={i}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="flex h-full w-screen flex-shrink-0 snap-center snap-always items-center justify-center p-4"
              >
                <img
                  src={img.url}
                  alt={img.alt ?? productName}
                  className="max-h-full max-w-full object-contain select-none"
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {/* Prev / Next — hidden on small screens where swipe is primary */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Previous image"
                className="absolute top-1/2 left-3 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
              >
                <ChevronGlyph dir="left" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                disabled={index === images.length - 1}
                aria-label="Next image"
                className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
              >
                <ChevronGlyph dir="right" />
              </button>
            </>
          )}

          {/* Counter — gives feedback on small screens without arrows */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
              {index + 1} / {images.length}
            </div>
          )}

          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
          >
            <XIcon className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ChevronGlyph({ dir }: { dir: "left" | "right" }) {
  const points = dir === "left" ? "15 6 9 12 15 18" : "9 6 15 12 9 18";
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points={points} />
    </svg>
  );
}
