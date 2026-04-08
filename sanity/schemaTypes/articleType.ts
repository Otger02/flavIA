import { defineType } from "sanity";

import { createLibraryFields } from "@/sanity/schemaTypes/libraryFields";

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: createLibraryFields("article"),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});