import { defineType } from "sanity";

import { createLibraryFields } from "./libraryFields";

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
