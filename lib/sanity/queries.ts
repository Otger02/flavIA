import { groq } from "next-sanity";

const libraryProjection = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  body,
  topicTags,
  intentTags,
  contentType,
  editorialSource,
  isPremium,
  chatRecommended,
  publishedAt,
  youtubeUrl,
  "relatedContent": relatedContent[]-> {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    contentType,
    editorialSource,
    youtubeUrl,
    isPremium
  },
  relatedProducts
}`;

export const libraryItemsQuery = groq`
  *[
    _type in ["article", "audio", "guide", "faq", "script", "video"]
    && defined(slug.current)
    && ($topic == null || $topic in topicTags)
    && ($intent == null || $intent in intentTags)
    && ($contentType == null || contentType == $contentType)
  ] | order(coalesce(publishedAt, _updatedAt) desc) ${libraryProjection}
`;

export const libraryItemBySlugQuery = groq`
  *[_type in ["article", "audio", "guide", "faq", "script", "video"] && slug.current == $slug][0] ${libraryProjection}
`;