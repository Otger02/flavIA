import { groq } from "next-sanity";

const libraryProjection = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  "excerpt": coalesce(excerpt, shortAnswer),
  shortAnswer,
  coverImage,
  body,
  topicTags,
  intentTags,
  sectionTag,
  audienceTags,
  "contentType": select(_type == "quicklyItem" => "quickly", coalesce(contentType, _type)),
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

const LIBRARY_TYPES = `["article", "audio", "guide", "faq", "script", "video", "quicklyItem"]`;

export const libraryItemsQuery = groq`
  *[
    _type in ${LIBRARY_TYPES}
    && defined(slug.current)
    && ($topic == null || $topic in topicTags)
    && ($intent == null || $intent in intentTags)
    && ($contentType == null || coalesce(contentType, select(_type == "quicklyItem" => "quickly", _type)) == $contentType)
    && ($section == null || sectionTag == $section)
    && ($audience == null || $audience in audienceTags)
    && ($excludeTeens == false || !("adolescentes" in coalesce(audienceTags, [])))
  ] | order(coalesce(publishedAt, _updatedAt) desc) ${libraryProjection}
`;

export const libraryItemBySlugQuery = groq`
  *[_type in ${LIBRARY_TYPES} && slug.current == $slug][0] ${libraryProjection}
`;