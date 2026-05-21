import type { MetadataRoute } from "next";

import { listBooks } from "@/features/books/server/get-books";
import { getLibraryItems } from "@/features/library/server/get-library-items";

const BASE_URL = "https://flavia.app";

/**
 * Dynamic sitemap. Built at request time so newly-published Sanity
 * articles and books appear without a redeploy. The Sanity fetchers
 * already gracefully fall back to the in-repo seed content when the
 * client is unconfigured, so this is safe in any environment.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static marketing surface — known a priori.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/sobre-flavia`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/library`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/libros`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/plans`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/comunidad`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic content — pulled from Sanity (or fallback seed).
  let libraryEntries: MetadataRoute.Sitemap = [];
  try {
    const items = await getLibraryItems();
    libraryEntries = items.map((item) => ({
      url: `${BASE_URL}/library/${item.slug}`,
      lastModified: item.publishedAt ? new Date(item.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("[sitemap] getLibraryItems failed", error);
  }

  let bookEntries: MetadataRoute.Sitemap = [];
  try {
    const books = await listBooks();
    bookEntries = books.map((book) => ({
      url: `${BASE_URL}/libros/${book.slug}`,
      lastModified: book.publishedAt ? new Date(book.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn("[sitemap] listBooks failed", error);
  }

  return [...staticEntries, ...libraryEntries, ...bookEntries];
}
