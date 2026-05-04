import type { StructureResolver } from "sanity/structure";

const LIBRARY_TYPES = ["article", "audio", "guide", "faq", "script", "video", "quicklyItem"];
const SHOP_TYPES = ["book", "affiliateProduct"];
const TOP_LEVEL_TYPES = [...LIBRARY_TYPES, ...SHOP_TYPES, "page"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Flavia")
    .items([
      // ── Biblioteca ────────────────────────────────────────────────
      S.listItem()
        .title("Biblioteca")
        .child(
          S.list()
            .title("Biblioteca")
            .items([
              S.documentTypeListItem("article").title("Articles"),
              S.documentTypeListItem("audio").title("Audios"),
              S.documentTypeListItem("guide").title("Guides"),
              S.documentTypeListItem("faq").title("FAQs"),
              S.documentTypeListItem("script").title("Scripts"),
              S.documentTypeListItem("video").title("Videos"),
              S.documentTypeListItem("quicklyItem").title("QuicKly items"),
            ]),
        ),

      S.divider(),

      // ── Libros ────────────────────────────────────────────────────
      S.listItem()
        .title("Libros")
        .child(
          S.list()
            .title("Libros")
            .items([S.documentTypeListItem("book").title("Books")]),
        ),

      // ── Productos afiliados ──────────────────────────────────────
      S.listItem()
        .title("Productos afiliados")
        .child(
          S.list()
            .title("Productos afiliados")
            .items([
              S.documentTypeListItem("affiliateProduct").title("Affiliate products"),
            ]),
        ),

      S.divider(),

      // ── Pages ────────────────────────────────────────────────────
      S.documentTypeListItem("page").title("Pages"),

      // ── Anything else (forwards-compatible) ──────────────────────
      ...S.documentTypeListItems().filter(
        (item) => !TOP_LEVEL_TYPES.includes(item.getId() ?? ""),
      ),
    ]);
