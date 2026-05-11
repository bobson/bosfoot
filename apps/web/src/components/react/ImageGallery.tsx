import { useState } from "react";

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
 * Vivobarefoot-style product gallery:
 *   - Main image on the right (large)
 *   - Vertical thumbnail strip on the left
 *   - Click thumbnail to swap main image
 *   - On mobile, thumbnails become a horizontal strip below the main image
 */
export default function ImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[var(--color-bg-secondary)] rounded-lg flex items-center justify-center text-[var(--color-ink-subtle)] text-sm">
        No image
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails — horizontal on mobile, vertical on desktop */}
      {images.length > 1 && (
        <div
          className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible md:w-20 flex-shrink-0"
          aria-label="Product images"
        >
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? "border-[var(--color-ink)]"
                  : "border-transparent hover:border-[var(--color-border-strong)]"
              }`}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <img
                src={img.thumbUrl}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 aspect-square bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden relative">
        <img
          src={active.url}
          alt={active.alt ?? productName}
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
