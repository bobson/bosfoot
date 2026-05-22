import { useEffect, useRef, useState } from "react";
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
              className="aspect-square w-screen flex-shrink-0 snap-center bg-secondary"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <img
                src={img.url}
                alt={img.alt ?? productName}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="h-full w-full object-cover"
                draggable={false}
              />
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

        <div className="relative aspect-square flex-1 overflow-hidden rounded-lg bg-secondary">
          <img
            src={active.url}
            alt={active.alt ?? productName}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </>
  );
}
