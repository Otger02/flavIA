import { defineArrayMember, defineField, defineType } from "sanity";

import {
  LIBRARY_AUDIENCES,
  LIBRARY_TOPIC_TAGS,
} from "../../features/library/constants";

export const quicklyItemType = defineType({
  name: "quicklyItem",
  title: "QuicKly Item",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortAnswer",
      title: "Short Answer",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sectionTag",
      title: "Section",
      type: "string",
      initialValue: "quickly",
      readOnly: true,
    }),
    defineField({
      name: "topicTags",
      title: "Topic Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: LIBRARY_TOPIC_TAGS.map((value) => ({ title: value, value })),
          },
        }),
      ],
    }),
    defineField({
      name: "audienceTags",
      title: "Audience Tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: LIBRARY_AUDIENCES.map((value) => ({ title: value, value })),
          },
        }),
      ],
    }),
    defineField({
      name: "isPremium",
      title: "Is Premium",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "shortAnswer",
    },
  },
});
