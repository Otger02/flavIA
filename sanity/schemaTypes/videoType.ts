import { defineType } from "sanity";

import { createLibraryFields } from "@/sanity/schemaTypes/libraryFields";

export const videoType = defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: createLibraryFields("video", { includeYoutubeUrl: true }),
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
      media: "coverImage",
    },
  },
});