import { defineType } from "sanity";

import { createLibraryFields } from "./libraryFields";

export const audioType = defineType({
  name: "audio",
  title: "Audio",
  type: "document",
  fields: createLibraryFields("audio"),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});
