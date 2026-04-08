import { defineArrayMember, defineField } from "sanity";

import {
  LIBRARY_CONTENT_TYPES,
  LIBRARY_DOCUMENT_TYPES,
  LIBRARY_INTENT_TAGS,
  LIBRARY_TOPIC_TAGS,
  type LibraryContentType,
} from "@/features/library/constants";

export function createLibraryFields(
  contentType: LibraryContentType,
  options?: { includeYoutubeUrl?: boolean },
) {
  return [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "coverImage", title: "Cover Image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "topicTags",
      title: "Topic Tags",
      type: "array",
      of: [defineArrayMember({ type: "string", options: { list: LIBRARY_TOPIC_TAGS.map((value) => ({ title: value, value })) } })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "intentTags",
      title: "Intent Tags",
      type: "array",
      of: [defineArrayMember({ type: "string", options: { list: LIBRARY_INTENT_TAGS.map((value) => ({ title: value, value })) } })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "contentType",
      title: "Content Type",
      type: "string",
      initialValue: contentType,
      options: { list: LIBRARY_CONTENT_TYPES.map((value) => ({ title: value, value })) },
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({ name: "isPremium", title: "Is Premium", type: "boolean", initialValue: false }),
    defineField({ name: "chatRecommended", title: "Chat Recommended", type: "boolean", initialValue: false }),
    defineField({
      name: "editorialSource",
      title: "Editorial Source",
      type: "string",
      initialValue: "Basado en la experiencia real de Flavia Dos Santos",
    }),
    ...(options?.includeYoutubeUrl
      ? [
          defineField({
            name: "youtubeUrl",
            title: "YouTube Embed URL",
            type: "url",
            validation: (rule) => rule.required(),
          }),
        ]
      : []),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({
      name: "relatedContent",
      title: "Related Content",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: LIBRARY_DOCUMENT_TYPES.map((type) => ({ type })),
        }),
      ],
    }),
    defineField({
      name: "relatedProducts",
      title: "Related Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "relatedProduct",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "href", title: "Link", type: "url", validation: (rule) => rule.required() }),
          ],
        }),
      ],
    }),
  ];
}