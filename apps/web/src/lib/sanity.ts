import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? "production";

if (!projectId) {
  throw new Error("Missing PUBLIC_SANITY_PROJECT_ID. Add it to apps/web/.env");
}

/**
 * Read-only client. We use the Sanity CDN (useCdn: true) for production builds —
 * served from edge cache, near-zero latency. In dev we hit the live API for
 * fresh data after Studio edits.
 */
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: import.meta.env.PROD,
  perspective: "published",
  // ignore drafts on the public site
});

/**
 * Image URL builder. Lets us request transformed sizes:
 *   urlFor(image).width(800).quality(80).format('webp').url()
 * Sanity does the resizing on their CDN — no build-time work needed.
 */
const builder = imageUrlBuilder(sanity);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
