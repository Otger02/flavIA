import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Flavia")
    .items([
      S.documentTypeListItem("article").title("Articles"),
      S.documentTypeListItem("audio").title("Audios"),
      S.documentTypeListItem("guide").title("Guides"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("script").title("Scripts"),
      S.documentTypeListItem("video").title("Videos"),
      S.documentTypeListItem("page").title("Pages"),
      ...S.documentTypeListItems().filter(
        (item) => !["article", "audio", "guide", "faq", "script", "video", "page"].includes(item.getId() ?? ""),
      ),
    ]);