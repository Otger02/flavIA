import type { LibrarySection } from "@/features/library/constants";

export type LibrarySectionConfig = {
  key: LibrarySection;
  icon: string;
  color: string;
  hasAudienceTabs: boolean;
};

export const LIBRARY_SECTION_TRANSLATION_KEYS: Record<LibrarySection, `library_sections.${LibrarySection}`> = {
  tips_educacion_sexual: "library_sections.tips_educacion_sexual",
  te_recomiendo: "library_sections.te_recomiendo",
  lo_mas_hablado: "library_sections.lo_mas_hablado",
  te_ha_pasado: "library_sections.te_ha_pasado",
  quickly: "library_sections.quickly",
  emocionalmente: "library_sections.emocionalmente",
};

export const LIBRARY_SECTION_CONFIG: LibrarySectionConfig[] = [
  {
    key: "tips_educacion_sexual",
    icon: "💡",
    color: "from-emerald-50 to-teal-50 border-emerald-200/50",
    hasAudienceTabs: true,
  },
  {
    key: "te_recomiendo",
    icon: "📚",
    color: "from-amber-50 to-orange-50 border-amber-200/50",
    hasAudienceTabs: false,
  },
  {
    key: "lo_mas_hablado",
    icon: "🔥",
    color: "from-rose-50 to-pink-50 border-rose-200/50",
    hasAudienceTabs: false,
  },
  {
    key: "te_ha_pasado",
    icon: "💬",
    color: "from-violet-50 to-purple-50 border-violet-200/50",
    hasAudienceTabs: false,
  },
  {
    key: "quickly",
    icon: "⚡",
    color: "from-sky-50 to-blue-50 border-sky-200/50",
    hasAudienceTabs: false,
  },
  {
    key: "emocionalmente",
    icon: "🧠",
    color: "from-fuchsia-50 to-pink-50 border-fuchsia-200/50",
    hasAudienceTabs: false,
  },
];

export function getSectionConfig(key: string): LibrarySectionConfig | undefined {
  return LIBRARY_SECTION_CONFIG.find((s) => s.key === key);
}

export function getSectionTranslationKey(key: string): `library_sections.${LibrarySection}` | null {
  return LIBRARY_SECTION_TRANSLATION_KEYS[key as LibrarySection] ?? null;
}
