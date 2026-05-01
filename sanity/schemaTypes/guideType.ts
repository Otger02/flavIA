import { defineType } from "sanity";

import { createLibraryFields } from "./libraryFields";

export const guideType = defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  fields: createLibraryFields("guide"),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});
