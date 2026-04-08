import { defineType } from "sanity";

import { createLibraryFields } from "@/sanity/schemaTypes/libraryFields";

export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: createLibraryFields("faq"),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});