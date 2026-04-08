import imageUrlBuilder from "@sanity/image-url";

import { sanityClient } from "@/lib/sanity/client";

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlForImage(source: unknown) {
  if (!builder || !source) {
    return null;
  }

  return builder.image(source);
}