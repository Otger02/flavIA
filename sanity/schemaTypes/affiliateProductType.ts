import { defineArrayMember, defineField, defineType } from "sanity";

import { LIBRARY_AUDIENCES } from "../../features/library/constants";
import {
  AFFILIATE_BRANDS,
  AFFILIATE_CONTEXT_TAGS,
} from "../../features/affiliate-products/constants";

export const affiliateProductType = defineType({
  name: "affiliateProduct",
  title: "Affiliate Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Product name",
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
      name: "brand",
      title: "Brand",
      type: "string",
      options: {
        list: AFFILIATE_BRANDS.map((value) => ({ title: value, value })),
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brandDisplayName",
      title: "Brand display name",
      type: "string",
      description: "Human-friendly brand label shown in the recommendation card.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "Up to 200 characters. Shown on the recommendation card.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "longDescription",
      title: "Long description",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      description: "Optional rich-text body for an in-app product detail view.",
    }),
    defineField({
      name: "productImage",
      title: "Product image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "affiliateUrl",
      title: "Affiliate URL",
      type: "url",
      description:
        "Tracked outbound link. Required for the product to be shown to users — the UI hides products without a URL.",
    }),
    defineField({
      name: "priceRange",
      title: "Price range",
      type: "string",
      description: 'Free-form, e.g. "150.000 — 200.000 COP".',
    }),
    defineField({
      name: "contexts",
      title: "Situational contexts",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: AFFILIATE_CONTEXT_TAGS.map((value) => ({ title: value, value })),
          },
        }),
      ],
      description:
        "Constrained list of situational tags the chat detection emits (e.g. 'menopausia', 'sequedad_vaginal').",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Free-form words or phrases that trigger this product when the chat sees them.",
    }),
    defineField({
      name: "audienceTags",
      title: "Audience tags",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: LIBRARY_AUDIENCES.map((value) => ({ title: value, value })),
          },
        }),
      ],
      description: "Reuses the LIBRARY_AUDIENCES taxonomy.",
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "number",
      description:
        "1–10. When multiple products match the same context, higher priority wins.",
      initialValue: 5,
      validation: (rule) => rule.min(1).max(10).integer(),
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description:
        "Quick on/off toggle. Inactive products never surface in the chat or any list.",
      initialValue: false,
    }),
    defineField({
      name: "commissionRate",
      title: "Commission rate",
      type: "number",
      description: "Internal tracking only — never shown to users. Decimal, e.g. 0.15 for 15%.",
      validation: (rule) => rule.min(0).max(1),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "datetime",
      description: "Set automatically by the seed/edit flows.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "brandDisplayName",
      media: "productImage",
    },
  },
});
