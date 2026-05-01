import "server-only";

import { groq } from "next-sanity";

import { sanityClient } from "@/lib/sanity/client";

const pdfQuery = groq`
  *[_type == "book" && slug.current == $slug][0] {
    "assetUrl": pdfFile.asset->url,
    "originalFilename": pdfFile.asset->originalFilename
  }
`;

type PdfRow = {
  assetUrl: string | null;
  originalFilename: string | null;
};

/**
 * Returns the Sanity asset URL + filename for a book's PDF.
 *
 * Sanity's CDN URLs are public-by-default — but the URL contains an
 * unguessable asset ID, and we only ever surface it to verified buyers.
 * For stricter access control (asset-level signed URLs), Sanity offers
 * `secret` mode on the file field — out of scope for this initial drop;
 * the route handler caches the URL in memory, never embeds it in a
 * server-rendered page, and never logs it.
 */
export async function getBookPdfAsset(slug: string): Promise<{
  url: string;
  filename: string;
} | null> {
  if (!sanityClient) return null;

  try {
    const row = await sanityClient.fetch<PdfRow | null>(
      pdfQuery,
      { slug },
      { next: { revalidate: 60 } },
    );

    if (!row?.assetUrl) return null;

    return {
      url: row.assetUrl,
      filename: row.originalFilename ?? `${slug}.pdf`,
    };
  } catch (error) {
    console.error("[books] getBookPdfAsset failed", error);
    return null;
  }
}
