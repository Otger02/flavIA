import { defineArrayMember, defineField, defineType } from "sanity";

export const bookType = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "pdfFile",
      title: "PDF File",
      type: "file",
      options: { accept: "application/pdf" },
      description:
        "The downloadable PDF served to verified buyers via a signed URL.",
    }),
    defineField({
      name: "priceCop",
      title: "Price (COP)",
      type: "number",
      initialValue: 30000,
      validation: (rule) => rule.required().min(0),
      description:
        "Per-book price in Colombian pesos. Defaults to 30000 but can be overridden per book.",
    }),
    defineField({
      name: "pages",
      title: "Pages",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "externalLinks",
      title: "External bookstore links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "externalLink",
          fields: [
            defineField({
              name: "name",
              title: "Bookstore name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Link",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
      description:
        "Optional list of physical bookstore links shown on the detail page.",
    }),
    defineField({
      name: "teaserExcerpt",
      title: "Teaser excerpt (free preview)",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description: "First chapter or sample shown for free.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "isAvailable",
      title: "Available for sale",
      type: "boolean",
      initialValue: true,
      description:
        "Hide from /libros without deleting the document. Set to false for drafts or out-of-stock.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "coverImage",
    },
  },
});
