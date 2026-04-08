import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { structure } from "@/structure";
import { schemaTypes } from "@/sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "Flavia Studio",
  projectId: process.env.SANITY_PROJECT_ID ?? "placeholder-project-id",
  dataset: process.env.SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
});