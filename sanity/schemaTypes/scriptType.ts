import { defineType } from "sanity";

import { createLibraryFields } from "@/sanity/schemaTypes/libraryFields";

export const scriptType = defineType({
  name: "script",
  title: "Script",
  type: "document",
  fields: createLibraryFields("script"),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});