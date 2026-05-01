import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { structure } from "./structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "flavIA",
  projectId: "li52jeft",
  dataset: "production",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
